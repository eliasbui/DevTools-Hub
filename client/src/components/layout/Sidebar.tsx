import { useState, useEffect } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  FileImage,
  Star,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder
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
  { id: 'color-converter', name: 'Color Converter', icon: Palette, category: 'design' },
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
  featured: { name: 'Featured', icon: Star },
  converters: { name: 'Data Converters', icon: Code },
  validation: { name: 'Validation & Debug', icon: Shield },
  generators: { name: 'Generators', icon: Wand2 },
  network: { name: 'API & Network', icon: Send },
  design: { name: 'CSS & Design', icon: Palette },
  text: { name: 'Text Processing', icon: Type },
  database: { name: 'Database Tools', icon: Database },
  security: { name: 'Security & Encryption', icon: Lock },
  file: { name: 'File Tools', icon: FileImage }
};

// Color scheme for categories
const categoryColors = {
  featured: 'text-purple-500 dark:text-purple-400',
  converters: 'text-blue-500 dark:text-blue-400',
  validation: 'text-green-500 dark:text-green-400',
  generators: 'text-pink-500 dark:text-pink-400',
  network: 'text-orange-500 dark:text-orange-400',
  design: 'text-indigo-500 dark:text-indigo-400',
  text: 'text-teal-500 dark:text-teal-400',
  database: 'text-yellow-500 dark:text-yellow-400',
  security: 'text-red-500 dark:text-red-400',
  file: 'text-cyan-500 dark:text-cyan-400'
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [location] = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['featured']));

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  // When searching, expand all categories with results
  useEffect(() => {
    if (search) {
      const categoriesWithResults = Object.keys(groupedTools);
      setExpandedCategories(new Set(categoriesWithResults));
    } else {
      setExpandedCategories(new Set(['featured']));
    }
  }, [search, groupedTools]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (expandedCategories.size === Object.keys(categories).length) {
      setExpandedCategories(new Set(['featured']));
    } else {
      setExpandedCategories(new Set(Object.keys(categories)));
    }
  };

  return (
    <TooltipProvider>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
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
          fixed left-0 top-0 h-full w-64 bg-background border-r border-border shadow-lg z-50 
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0 mt-[16px] mb-[16px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.div 
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
              >
                <Wand2 className="w-4 h-4 text-primary-foreground" />
              </motion.div>
              <span className="text-lg font-semibold text-foreground">DevTools Hub</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 pb-2 border-b border-border flex-shrink-0">
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
              className="pl-10 smooth-transition"
            />
          </motion.div>
          
          {/* Expand/Collapse All */}
          <motion.div 
            className="mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              {expandedCategories.size === Object.keys(categories).length ? (
                <>
                  <Folder className="w-3 h-3 mr-1" />
                  Collapse all
                </>
              ) : (
                <>
                  <FolderOpen className="w-3 h-3 mr-1" />
                  Expand all
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 min-h-0">
          <nav className="space-y-2 p-4">
            {Object.entries(categories).map(([key, category], categoryIndex) => {
              const categoryTools = groupedTools[key] || [];
              const toolCount = tools.filter(t => t.category === key).length;
              const isExpanded = expandedCategories.has(key);
              const CategoryIcon = category.icon;
              
              // Hide empty categories when searching
              if (search && categoryTools.length === 0) return null;

              return (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + categoryIndex * 0.05 }}
                  className="border border-border/50 rounded-lg overflow-hidden"
                >
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleCategory(key)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-3 hover:bg-accent/50"
                      >
                        <div className="flex items-center">
                          <CategoryIcon className={`w-4 h-4 mr-2 ${categoryColors[key as keyof typeof categoryColors]}`} />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {search ? `${categoryTools.length}/${toolCount}` : toolCount}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-2 pb-2 space-y-1">
                        {categoryTools.map((tool, toolIndex) => {
                          const Icon = tool.icon;
                          const isActive = location === `/tool/${tool.id}` || (location === '/' && tool.id === 'smart-paste');
                          
                          return (
                            <motion.div
                              key={tool.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 + toolIndex * 0.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={tool.id === 'smart-paste' ? '/' : `/tool/${tool.id}`}>
                                    <div 
                                      onClick={() => setIsOpen(false)}
                                      className={`flex items-center w-full px-3 py-2 rounded-md text-sm smooth-transition cursor-pointer ${
                                        isActive 
                                          ? 'gradient-primary text-white shadow-sm' 
                                          : 'text-foreground hover:bg-green-500/20 hover:text-green-700 dark:hover:text-green-400'
                                      }`}
                                    >
                                      <Icon className={`w-3.5 h-3.5 mr-2 ${
                                        isActive ? 'text-white' : categoryColors[key as keyof typeof categoryColors]
                                      }`} />
                                      <span className={isActive ? 'font-medium' : ''}>{tool.name}</span>
                                    </div>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="notification-pop">
                                  <p className="font-medium">{tool.name}</p>
                                  <p className="text-xs text-muted-foreground">Click to use this tool</p>
                                </TooltipContent>
                              </Tooltip>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
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
            transition={{ delay: 0.7 }}
          >
            <Link href="/favorites">
              <Button 
                variant={location === '/favorites' ? 'default' : 'ghost'} 
                className="w-full justify-start text-foreground hover:bg-green-500/20 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Star className="w-4 h-4 mr-2" />
                Favorites
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link href="/settings">
              <Button 
                variant={location === '/settings' ? 'default' : 'ghost'} 
                className="w-full justify-start text-foreground hover:bg-green-500/20 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}