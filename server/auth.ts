import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { Express, RequestHandler } from "express";
import { getSession, isAuthenticated as isReplitAuth } from "./replitAuth";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import * as client from "openid-client";
import { Strategy as OidcStrategy, type VerifyFunction } from "openid-client/passport";
import memoize from "memoizee";

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await storage.upsertUser({
        id: profile.id,
        email: profile.emails?.[0]?.value || null,
        firstName: profile.name?.givenName || null,
        lastName: profile.name?.familyName || null,
        profileImageUrl: profile.photos?.[0]?.value || null,
        provider: 'google'
      });
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }));
}

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    if (!user.password) {
      return done(null, false, { message: 'Please use social login' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize/Deserialize user - handle both Replit and other auth methods
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser(async (user: any, done) => {
  done(null, user);
});

// Email transporter
const createEmailTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || 
      !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email configuration missing');
    return null;
  }
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Helper functions for Replit auth
const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertReplitUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    provider: 'replit'
  });
}

export async function setupMultiAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Setup Replit authentication strategies
  if (process.env.REPLIT_DOMAINS) {
    const config = await getOidcConfig();
    
    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertReplitUser(tokens.claims());
      verified(null, user);
    };
    
    for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
      const strategy = new OidcStrategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
    }
    
    // Replit auth routes
    app.get("/api/login", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });
    
    app.get("/api/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });
    
    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
  }
  
  // Google OAuth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  app.get('/api/auth/google/callback',
    passport.authenticate('google', { 
      successRedirect: '/',
      failureRedirect: '/login' 
    })
  );
  
  // Local auth routes
  app.post('/api/auth/login', 
    passport.authenticate('local'),
    (req, res) => {
      res.json({ success: true, user: req.user });
    }
  );
  
  // Sign up route
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        id: randomBytes(16).toString('hex'),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        provider: 'local'
      });
      
      // Log them in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed' });
        }
        res.json({ success: true, user });
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Signup failed' });
    }
  });
  
  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists
        return res.json({ success: true });
      }
      
      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour
      
      await storage.updateUser(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      });
      
      // Send email
      const transporter = createEmailTransporter();
      if (transporter) {
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
        
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@devtools-hub.com',
          to: email,
          subject: 'Password Reset Request',
          html: `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  });
  
  // Reset password route
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      
      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });
  
  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Check if this is a Replit auth user and handle token refresh
  const user = req.user as any;
  if (user && user.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (now > user.expires_at) {
      const refreshToken = user.refresh_token;
      if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      try {
        const config = await getOidcConfig();
        const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
        updateUserSession(user, tokenResponse);
      } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
  }
  
  next();
};