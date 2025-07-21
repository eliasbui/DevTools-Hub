
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { tools, categories, categoryColors } from '@/lib/toolsData';
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
  Star
} from 'lucide-react';

// Tools, categories, and categoryColors are now imported from @/lib/toolsData

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [location] = useLocation();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    // Initialize all categories as open by default
    const initial: Record<string, boolean> = {};
    Object.keys(categories).forEach(key => {
      initial[key] = true;
    });
    return initial;
  });

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

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
          fixed left-0 top-0 h-full w-60 bg-background border-r border-border shadow-lg z-50 
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        initial={{ x: -240 }}
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
        <div className="p-4 border-b border-border flex-shrink-0 space-y-3">
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
          
          {/* Expand/Collapse All Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allOpen = Object.values(openCategories).every(v => v);
                const newState: Record<string, boolean> = {};
                Object.keys(categories).forEach(key => {
                  newState[key] = !allOpen;
                });
                setOpenCategories(newState);
              }}
              className="flex-1 text-xs"
            >
              {Object.values(openCategories).every(v => v) ? 'Collapse All' : 'Expand All'}
            </Button>
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
                  <Collapsible
                    open={openCategories[key]}
                    onOpenChange={(open) => setOpenCategories(prev => ({ ...prev, [key]: open }))}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`w-full justify-between p-2 mb-2 hover:bg-accent/50 group transition-all ${
                          openCategories[key] ? 'bg-accent/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {label}
                          </h3>
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {categoryTools.length}
                          </span>
                        </div>
                        <ChevronDown 
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                            openCategories[key] ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-2">
                      {categoryTools.map((tool, toolIndex) => {
                      const Icon = tool.icon;
                      const isActive = location === `/tool/${tool.id}` || (location === '/' && tool.id === 'smart-paste');
                      
                      return (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + categoryIndex * 0.1 + toolIndex * 0.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={tool.id === 'smart-paste' ? '/' : `/tool/${tool.id}`}>
                                <Button
                                  variant={isActive ? 'default' : 'ghost'}
                                  className={`w-full justify-start smooth-transition ${
                                    isActive 
                                      ? 'gradient-primary text-white shadow-lg' 
                                      : 'text-foreground hover:bg-green-500/20 hover:text-green-700 dark:hover:text-green-400'
                                  }`}
                                  onClick={() => setIsOpen(false)}
                                >
                                  <motion.div
                                    className="flex items-center justify-center"
                                  >
                                    <Icon className={`w-4 h-4 mr-2 icon-bounce ${
                                      isActive ? 'text-white' : categoryColors[key as keyof typeof categoryColors]
                                    }`} />
                                  </motion.div>
                                  <span className={isActive ? 'font-semibold' : ''}>{tool.name}</span>
                                </Button>
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
