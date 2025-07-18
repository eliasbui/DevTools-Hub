
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, 
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
  Settings,
  Menu,
  X,
  Send,
  Grid,
  Palette,
  Eye,
  QrCode,
  FileText,
  Network,
  Database,
  FileCode,
  Calculator,
  BarChart,
  FileCode2,
  Replace,
  List,
  Scissors,
  Table,
  Lock,
  FileKey,
  Archive,
  FileImage
} from 'lucide-react';

const tools = [
  { id: 'smart-paste', name: 'Smart Paste', icon: Wand2, category: 'featured' },
  { id: 'data-visualization', name: 'Data Visualization', icon: Network, category: 'featured' },
  { id: 'json-formatter', name: 'JSON Formatter', icon: Code, category: 'converters' },
  { id: 'base64-tool', name: 'Base64 Encoder', icon: Key, category: 'converters' },
  { id: 'url-encoder', name: 'URL Encoder', icon: LinkIcon, category: 'converters' },
  { id: 'timestamp-converter', name: 'Timestamp Converter', icon: Clock, category: 'converters' },
  { id: 'regex-tester', name: 'Regex Tester', icon: Search, category: 'validation' },
  { id: 'text-diff', name: 'Text Diff Checker', icon: GitCompare, category: 'validation' },
  { id: 'jwt-debugger', name: 'JWT Debugger', icon: Shield, category: 'validation' },
  { id: 'uuid-generator', name: 'UUID Generator', icon: Fingerprint, category: 'generators' },
  { id: 'hash-generator', name: 'Hash Generator', icon: Hash, category: 'generators' },
  { id: 'lorem-generator', name: 'Lorem Ipsum', icon: Type, category: 'generators' },
  { id: 'password-generator', name: 'Password Generator', icon: Shield, category: 'generators' },
  { id: 'http-client', name: 'HTTP Client', icon: Send, category: 'network' },
  { id: 'css-grid-generator', name: 'CSS Grid Generator', icon: Grid, category: 'design' },
  { id: 'color-palette', name: 'Color Palette', icon: Palette, category: 'design' },
  { id: 'box-shadow-generator', name: 'Box Shadow', icon: Eye, category: 'design' },
  { id: 'text-case-converter', name: 'Text Case', icon: Type, category: 'text' },
  { id: 'qr-code-generator', name: 'QR Code', icon: QrCode, category: 'generators' },
  { id: 'csv-converter', name: 'CSV Converter', icon: FileText, category: 'converters' },
  { id: 'markdown-converter', name: 'Markdown Converter', icon: FileText, category: 'converters' },
  { id: 'yaml-converter', name: 'YAML Converter', icon: FileText, category: 'converters' },
  { id: 'sql-formatter', name: 'SQL Formatter', icon: Database, category: 'database' },
  { id: 'xml-formatter', name: 'XML Formatter', icon: FileCode, category: 'converters' },
  { id: 'password-strength', name: 'Password Strength', icon: Shield, category: 'security' },
  { id: 'unit-converter', name: 'Unit Converter', icon: Calculator, category: 'converters' },
  { id: 'text-statistics', name: 'Text Statistics', icon: BarChart, category: 'text' },
  { id: 'text-encoder', name: 'Text Encoder', icon: FileCode2, category: 'text' },
  { id: 'text-replacer', name: 'Text Replacer', icon: Replace, category: 'text' },
  { id: 'line-tools', name: 'Line Tools', icon: List, category: 'text' },
  { id: 'text-splitter', name: 'Text Splitter', icon: Scissors, category: 'text' },
  { id: 'character-counter', name: 'Character Counter', icon: Calculator, category: 'text' },
  { id: 'markdown-to-html', name: 'Markdown to HTML', icon: FileText, category: 'text' },
  { id: 'database-schema-visualizer', name: 'Schema Visualizer', icon: Database, category: 'database' },
  { id: 'sql-query-builder', name: 'Query Builder', icon: Table, category: 'database' },
  { id: 'connection-string-builder', name: 'Connection String', icon: LinkIcon, category: 'database' },
  { id: 'mock-data-generator', name: 'Mock Data', icon: Database, category: 'database' },
  { id: 'ssl-certificate-analyzer', name: 'SSL Certificate', icon: Shield, category: 'security' },
  { id: 'encryption-tools', name: 'Encryption', icon: Lock, category: 'security' }, 
  { id: 'hmac-generator', name: 'HMAC Generator', icon: Key, category: 'security' },
  { id: 'certificate-decoder', name: 'Certificate Decoder', icon: FileKey, category: 'security' },
  { id: 'file-checksum-calculator', name: 'File Checksum', icon: Hash, category: 'file' },
  { id: 'file-sum-calculator', name: 'File Analyzer', icon: BarChart, category: 'file' },
  { id: 'secure-zip-viewer', name: 'ZIP Viewer', icon: Archive, category: 'file' },
  { id: 'image-converter', name: 'Image Converter', icon: FileImage, category: 'file' },
  { id: 'code-minifier', name: 'Code Minifier', icon: FileCode, category: 'converters' },
  { id: 'svg-optimizer', name: 'SVG Optimizer', icon: FileImage, category: 'file' },
  { id: 'cron-expression-builder', name: 'Cron Builder', icon: Clock, category: 'generators' },
];

const categories = {
  featured: 'Featured',
  converters: 'Data Converters',
  validation: 'Validation & Debug',
  generators: 'Generators',
  network: 'API & Network',
  design: 'CSS & Design',
  text: 'Text Processing',
  database: 'Database Tools',
  security: 'Security & Encryption',
  file: 'File Tools'
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [location] = useLocation();

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        className={`
          fixed left-0 top-0 h-full w-60 bg-background border-r border-border shadow-lg z-50 
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        initial={{ x: -240 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.div 
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Wand2 className="w-4 h-4 text-primary-foreground" />
              </motion.div>
              <span className="text-lg font-semibold text-foreground">DevTools Hub</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="lg:hidden animate-pulse-hover"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 smooth-transition focus:scale-105"
            />
          </motion.div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 min-h-0">
          <nav className="space-y-6 p-4">
            {Object.entries(categories).map(([key, label], categoryIndex) => {
              const categoryTools = groupedTools[key] || [];
              if (categoryTools.length === 0) return null;

              return (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + categoryIndex * 0.1 }}
                >
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {label}
                  </h3>
                  <div className="space-y-1">
                    {categoryTools.map((tool, toolIndex) => {
                      const Icon = tool.icon;
                      const isActive = location === `/tool/${tool.id}` || (location === '/' && tool.id === 'smart-paste');
                      
                      return (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + categoryIndex * 0.1 + toolIndex * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link href={tool.id === 'smart-paste' ? '/' : `/tool/${tool.id}`}>
                            <Button
                              variant={isActive ? 'default' : 'ghost'}
                              className={`w-full justify-start smooth-transition ${
                                isActive 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'text-foreground hover:bg-accent'
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                              >
                                <Icon className="w-4 h-4 mr-2" />
                              </motion.div>
                              {tool.name}
                            </Button>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Settings & Other Pages */}
        <div className="p-4 border-t border-border flex-shrink-0 space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link href="/settings">
              <Button 
                variant={location === '/settings' ? 'default' : 'ghost'} 
                className="w-full justify-start text-foreground animate-pulse-hover"
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                </motion.div>
                Settings
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
