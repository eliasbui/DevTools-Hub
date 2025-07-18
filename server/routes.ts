import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertToolUsageSchema, 
  insertSavedDataSchema, 
  insertApiHistorySchema 
} from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import userRoutes from "./routes/userRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Check usage limits middleware
  const checkUsageLimits = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { allowed, count } = await storage.incrementDailyUsage(userId);
      if (!allowed) {
        return res.status(403).json({ 
          message: "Daily limit exceeded", 
          limit: 100,
          count,
          plan: "free"
        });
      }
      next();
    } catch (error) {
      console.error("Error checking usage limits:", error);
      res.status(500).json({ message: "Failed to check usage limits" });
    }
  };

  // Tool usage tracking
  app.post("/api/tool-usage", isAuthenticated, checkUsageLimits, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = insertToolUsageSchema.parse({ ...req.body, userId });
      const result = await storage.recordToolUsage(usage);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid tool usage data" });
    }
  });

  app.get("/api/tool-usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = await storage.getUserToolUsage(userId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tool usage" });
    }
  });

  // Saved data management
  app.post("/api/saved-data", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertSavedDataSchema.parse({ ...req.body, userId });
      const result = await storage.saveData(data);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid saved data" });
    }
  });

  app.get("/api/saved-data", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const toolId = req.query.toolId as string;
      const data = await storage.getSavedData(userId, toolId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved data" });
    }
  });

  app.delete("/api/saved-data/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const success = await storage.deleteSavedData(id, userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete saved data" });
    }
  });

  // API history
  app.post("/api/api-history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = insertApiHistorySchema.parse({ ...req.body, userId });
      const result = await storage.saveApiHistory(history);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid API history data" });
    }
  });

  app.get("/api/api-history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getApiHistory(userId, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API history" });
    }
  });

  app.delete("/api/api-history/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const success = await storage.deleteApiHistory(id, userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete API history" });
    }
  });

  // User routes
  app.use(userRoutes);

  // AI routes
  const { registerAIRoutes } = await import("./routes/aiRoutes");
  registerAIRoutes(app);

  // Favorites routes
  const { registerFavoritesRoutes } = await import("./routes/favoritesRoutes");
  registerFavoritesRoutes(app);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
