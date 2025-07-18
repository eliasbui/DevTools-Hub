import { Layout } from '@/components/layout/Layout';
import { SmartPaste } from '@/components/tools/SmartPaste';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Code, 
  Key, 
  Link as LinkIcon, 
  Clock, 
  Search, 
  GitCompare, 
  Shield, 
  Fingerprint, 
  Hash, 
  Type,
  CheckCircle,
  History,
  LogOut,
  Sparkles
} from 'lucide-react';

const quickTools = [
  { id: 'json-formatter', name: 'JSON Formatter', icon: Code, description: 'Format, validate, and minify JSON data', color: 'text-blue-500' },
  { id: 'base64-tool', name: 'Base64 Encoder', icon: Key, description: 'Encode and decode Base64 strings', color: 'text-green-500' },
  { id: 'uuid-generator', name: 'UUID Generator', icon: Fingerprint, description: 'Generate unique identifiers (v1, v4, v5)', color: 'text-purple-500' },
];

export function Home() {
  const { user } = useAuth();

  return (
    <Layout 
      title="Smart Paste & Auto-Detection"
      description="Paste any content and let us automatically detect and format it"
    >
      <div className="space-y-6">
        {/* User Profile Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-primary/20 smooth-transition hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant={user.plan === 'free' ? 'secondary' : 'default'}>
                            {user.plan === 'free' ? <span>Free</span> : <><Sparkles className="w-3 h-3 mr-1" /> {user.plan}</>}
                          </Badge>
                        </motion.div>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.plan === 'free' && (
                        <motion.p 
                          className="text-xs text-muted-foreground mt-1"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {100 - (user.dailyUsageCount || 0)} operations remaining today
                        </motion.p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.plan === 'free' && (
                      <Link href="/pricing">
                        <Button variant="outline" size="sm">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Upgrade
                        </Button>
                      </Link>
                    )}
                    <a href="/api/logout">
                      <Button variant="ghost" size="sm">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Smart Paste Component */}
        <SmartPaste />

        {/* Quick Tools Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {quickTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="cursor-pointer"
              >
                <Card className="smooth-transition">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <motion.div
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className={`w-5 h-5 ${tool.color}`} />
                      </motion.div>
                      <span>{tool.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                    <div className="space-y-2">
                      <Link href={`/tool/${tool.id}`}>
                        <Button className="w-full">
                          Open Tool
                        </Button>
                      </Link>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Fast & Accurate</span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Client-side</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Feature Showcase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              <span>Example: JWT Token Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">JWT Token</label>
                <div className="p-3 border rounded-lg bg-muted/50 font-mono text-xs">
                  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Decoded Payload</label>
                <div className="p-3 border rounded-lg bg-muted/50 font-mono text-xs">
                  <pre className="text-foreground">{JSON.stringify({
                    sub: "1234567890",
                    name: "John Doe",
                    iat: 1516239022
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Valid signature</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Issued: Jan 18, 2018</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="w-5 h-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Your recent tool usage will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
