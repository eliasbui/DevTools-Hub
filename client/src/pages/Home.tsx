import { Layout } from '@/components/layout/Layout';
import { SmartPaste } from '@/components/tools/SmartPaste';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
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
  
  // Fetch recent tool usage
  const { data: recentActivity } = useQuery({
    queryKey: ['/api/tool-usage'],
    enabled: !!user,
  });

  return (
    <Layout 
      title="Smart Paste & Auto-Detection"
      description="Paste any content and let us automatically detect and format it"
    >
      <div className="space-y-6">
        
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">JWT Token</label>
                <div className="p-2 md:p-3 border rounded-lg bg-muted/50 font-mono text-[10px] md:text-xs break-all">
                  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Decoded Payload</label>
                <div className="p-2 md:p-3 border rounded-lg bg-muted/50 font-mono text-[10px] md:text-xs">
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
            {!recentActivity || recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Your recent tool usage will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity: any) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Link href={`/tool/${activity.toolId}`}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Code className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.toolName}</p>
                          <p className="text-xs text-muted-foreground">
                            Used {activity.usageCount} time{activity.usageCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.lastUsed), { addSuffix: true })}
                    </div>
                  </motion.div>
                ))}
                {recentActivity.length > 5 && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    And {recentActivity.length - 5} more...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
