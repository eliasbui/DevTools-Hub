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
  Sparkles,
  Zap,
  Palette,
  FileText,
  Database,
  Lock,
  FileCode,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

const toolCategories = [
  {
    name: 'Data Converters',
    icon: Code,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    tools: [
      { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, and minify JSON data' },
      { id: 'base64-tool', name: 'Base64 Tool', description: 'Encode and decode Base64 strings' },
      { id: 'url-encoder', name: 'URL Encoder', description: 'Encode and decode URLs' },
      { id: 'csv-converter', name: 'CSV Converter', description: 'Convert CSV data to JSON, XML, YAML, or SQL' },
      { id: 'markdown-converter', name: 'Markdown Converter', description: 'Convert Markdown to HTML with live preview' },
      { id: 'yaml-converter', name: 'YAML Converter', description: 'Convert between YAML, JSON, and XML formats' },
      { id: 'xml-formatter', name: 'XML Formatter', description: 'Format, validate, and beautify XML documents' },
      { id: 'unit-converter', name: 'Unit Converter', description: 'Convert between various units' },
      { id: 'code-minifier', name: 'Code Minifier', description: 'Minify and beautify JS, CSS, HTML, JSON' },
    ]
  },
  {
    name: 'Validators & Testers',
    icon: Shield,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    tools: [
      { id: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions' },
      { id: 'jwt-debugger', name: 'JWT Debugger', description: 'Parse and analyze JWT tokens' },
      { id: 'text-diff', name: 'Text Diff Checker', description: 'Compare texts and highlight differences' },
    ]
  },
  {
    name: 'Generators',
    icon: Zap,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    tools: [
      { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate unique identifiers' },
      { id: 'hash-generator', name: 'Hash Generator', description: 'Generate MD5, SHA hashes' },
      { id: 'lorem-generator', name: 'Lorem Ipsum', description: 'Generate placeholder text' },
      { id: 'password-generator', name: 'Password Generator', description: 'Generate secure passwords' },
      { id: 'qr-code-generator', name: 'QR Code Generator', description: 'Generate QR codes' },
      { id: 'cron-expression-builder', name: 'Cron Builder', description: 'Build cron expressions visually' },
    ]
  },
  {
    name: 'Timestamp & API',
    icon: Clock,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    tools: [
      { id: 'timestamp-converter', name: 'Timestamp Converter', description: 'Convert Unix timestamps' },
      { id: 'http-client', name: 'HTTP Client', description: 'Send HTTP requests and test APIs' },
    ]
  },
  {
    name: 'CSS & Design',
    icon: Palette,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    tools: [
      { id: 'css-grid-generator', name: 'CSS Grid Generator', description: 'Create CSS Grid layouts' },
      { id: 'color-palette', name: 'Color Palette', description: 'Generate harmonious color schemes' },
      { id: 'color-converter', name: 'Color Converter', description: 'Convert between color formats' },
      { id: 'box-shadow-generator', name: 'Box Shadow', description: 'Create CSS box shadows' },
    ]
  },
  {
    name: 'Text Processing',
    icon: FileText,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    tools: [
      { id: 'text-case-converter', name: 'Case Converter', description: 'Convert text between cases' },
      { id: 'text-statistics', name: 'Text Statistics', description: 'Analyze text metrics' },
      { id: 'text-encoder', name: 'Text Encoder', description: 'Encode/decode text formats' },
      { id: 'text-replacer', name: 'Text Replacer', description: 'Batch find and replace' },
      { id: 'line-tools', name: 'Line Tools', description: 'Sort, filter, manipulate lines' },
      { id: 'text-splitter', name: 'Text Splitter', description: 'Split text by patterns' },
      { id: 'character-counter', name: 'Character Counter', description: 'Character analysis' },
      { id: 'markdown-to-html', name: 'Markdown to HTML', description: 'Convert with preview' },
    ]
  },
  {
    name: 'Database Tools',
    icon: Database,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    tools: [
      { id: 'sql-formatter', name: 'SQL Formatter', description: 'Format SQL queries' },
      { id: 'database-schema-visualizer', name: 'Schema Visualizer', description: 'Generate ERD' },
      { id: 'sql-query-builder', name: 'Query Builder', description: 'Visual SQL construction' },
      { id: 'connection-string-builder', name: 'Connection Builder', description: 'Database connections' },
      { id: 'mock-data-generator', name: 'Mock Data', description: 'Generate test data' },
    ]
  },
  {
    name: 'Security & Encryption',
    icon: Lock,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    tools: [
      { id: 'password-strength', name: 'Password Strength', description: 'Analyze password security' },
      { id: 'ssl-certificate-analyzer', name: 'SSL Analyzer', description: 'Check certificates' },
      { id: 'encryption-tools', name: 'Encryption Tools', description: 'AES, DES, RSA encryption' },
      { id: 'hmac-generator', name: 'HMAC Generator', description: 'Message authentication codes' },
      { id: 'certificate-decoder', name: 'Certificate Decoder', description: 'Parse X.509 certificates' },
    ]
  },
  {
    name: 'File Processing',
    icon: FileCode,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    tools: [
      { id: 'file-checksum-calculator', name: 'File Checksum', description: 'Calculate file hashes' },
      { id: 'file-sum-calculator', name: 'File Analyzer', description: 'File statistics' },
      { id: 'secure-zip-viewer', name: 'ZIP Viewer', description: 'Browse archives safely' },
      { id: 'image-converter', name: 'Image Converter', description: 'Convert image formats' },
      { id: 'svg-optimizer', name: 'SVG Optimizer', description: 'Optimize SVG files' },
    ]
  },
  {
    name: 'Data Visualization',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    tools: [
      { id: 'data-visualization', name: 'Data Visualizer', description: 'Interactive graphs from data' },
    ]
  },
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

        {/* All Tools by Category */}
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">All Developer Tools</h2>
            <p className="text-muted-foreground">47 tools organized by category</p>
          </div>
          
          {toolCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + categoryIndex * 0.1 }}
                className="space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${category.bgColor}`}>
                    <Icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <Badge variant="secondary" className="ml-2">
                    {category.tools.length} tools
                  </Badge>
                </div>
                
                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.tools.map((tool, toolIndex) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.3 + categoryIndex * 0.05 + toolIndex * 0.02 
                      }}
                    >
                      <Link href={`/tool/${tool.id}`}>
                        <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{tool.name}</h4>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {tool.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

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
                    <Link href={`/tool/${activity.toolId}?loadData=true`}>
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
