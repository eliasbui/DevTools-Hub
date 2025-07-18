import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Star, ArrowRight, Sparkles, Code, Key, Link as LinkIcon, Clock, Search, GitCompare, Shield, Fingerprint, Hash, Type, Send, Grid, Palette, Table, Archive, BarChart, FileImage, FileCode, Lock, FileKey, Database } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from 'wouter';
// Tool categories for favorites display
const categories = {
  featured: 'Featured',
  converters: 'Data Converters',
  validation: 'Validators',
  generators: 'Generators',
  network: 'API & Network',
  design: 'CSS & Design',
  text: 'Text Processing',
  database: 'Database Tools',
  security: 'Security Tools',
  file: 'File Tools'
};

export function Favorites() {
  const { favorites, isLoading } = useFavorites();

  // Get tool details from favorites  
  const favoriteTools = favorites.map((fav: any) => {
    // Map of tool IDs to their details
    const toolsData: Record<string, { name: string; description: string; category: string; icon: any }> = {
      'json-formatter': { name: 'JSON Formatter', description: 'Format, validate, and minify JSON data', category: 'converters', icon: Code },
      'base64-tool': { name: 'Base64 Encoder/Decoder', description: 'Encode and decode Base64 strings', category: 'converters', icon: Key },
      'url-encoder': { name: 'URL Encoder/Decoder', description: 'Encode and decode URLs', category: 'converters', icon: LinkIcon },
      'timestamp-converter': { name: 'Timestamp Converter', description: 'Convert Unix timestamps to dates', category: 'converters', icon: Clock },
      'regex-tester': { name: 'Regex Tester', description: 'Test regular expressions', category: 'validation', icon: Search },
      'text-diff': { name: 'Text Diff Checker', description: 'Compare two texts', category: 'validation', icon: GitCompare },
      'jwt-debugger': { name: 'JWT Debugger', description: 'Parse and analyze JWT tokens', category: 'validation', icon: Shield },
      'uuid-generator': { name: 'UUID Generator', description: 'Generate unique identifiers', category: 'generators', icon: Fingerprint },
      'hash-generator': { name: 'Hash Generator', description: 'Generate various hashes', category: 'generators', icon: Hash },
      'lorem-generator': { name: 'Lorem Ipsum Generator', description: 'Generate placeholder text', category: 'generators', icon: Type },
      'password-generator': { name: 'Password Generator', description: 'Generate secure passwords', category: 'generators', icon: Shield },
      'http-client': { name: 'HTTP Client', description: 'Make API requests', category: 'network', icon: Send },
      'css-grid-generator': { name: 'CSS Grid Generator', description: 'Generate CSS Grid layouts', category: 'design', icon: Grid },
      'color-palette': { name: 'Color Palette Generator', description: 'Generate color schemes', category: 'design', icon: Palette },
      'box-shadow-generator': { name: 'Box Shadow Generator', description: 'Create CSS box shadows', category: 'design', icon: Grid },
      'text-case-converter': { name: 'Text Case Converter', description: 'Convert text cases', category: 'text', icon: Type },
      'qr-code-generator': { name: 'QR Code Generator', description: 'Generate QR codes', category: 'generators', icon: Code },
      'csv-converter': { name: 'CSV Converter', description: 'Convert CSV data', category: 'converters', icon: Table },
      'markdown-converter': { name: 'Markdown Converter', description: 'Convert Markdown to HTML', category: 'converters', icon: Code },
    };
    
    const tool = toolsData[fav.toolId];
    if (tool) {
      return {
        id: fav.toolId,
        name: tool.name,
        description: tool.description,
        categoryName: categories[tool.category] || tool.category,
        icon: tool.icon
      };
    }
    
    // Default icon for tools not in the list
    return {
      id: fav.toolId,
      name: fav.toolId,
      description: 'Developer tool',
      categoryName: 'Tools',
      icon: Code
    };
  }).filter(Boolean);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            </motion.div>
            <h1 className="text-4xl font-bold">Favorite Tools</h1>
          </div>
          <p className="text-muted-foreground">
            Your starred tools for quick access
          </p>
        </motion.div>

        <Separator className="mb-8" />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
        ) : favoriteTools.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start adding tools to your favorites by clicking the star icon on any tool page
            </p>
            <Link href="/home">
              <Button>
                Explore Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {favoriteTools.map((tool: any) => (
              <motion.div key={tool.id} variants={item}>
                <Link href={`/tool/${tool.id}`}>
                  <Card className="group hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <tool.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {tool.name}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {tool.categoryName}
                            </Badge>
                          </div>
                        </div>
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{tool.description}</CardDescription>
                      <div className="mt-4 flex items-center text-sm text-muted-foreground">
                        <ArrowRight className="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform" />
                        Open tool
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}