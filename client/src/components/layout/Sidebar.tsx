import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  X
} from 'lucide-react';

const tools = [
  { id: 'smart-paste', name: 'Smart Paste', icon: Wand2, category: 'featured' },
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
];

const categories = {
  featured: 'Featured',
  converters: 'Data Converters',
  validation: 'Validation & Debug',
  generators: 'Generators'
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
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-60 bg-background border-r border-border shadow-lg z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-primary-foreground" />
              </div>
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
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-6">
            {Object.entries(categories).map(([key, label]) => {
              const categoryTools = groupedTools[key] || [];
              if (categoryTools.length === 0) return null;

              return (
                <div key={key}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {label}
                  </h3>
                  <div className="space-y-1">
                    {categoryTools.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = location === `/tool/${tool.id}` || (location === '/' && tool.id === 'smart-paste');
                      
                      return (
                        <Link key={tool.id} href={tool.id === 'smart-paste' ? '/' : `/tool/${tool.id}`}>
                          <Button
                            variant={isActive ? 'default' : 'ghost'}
                            className={`w-full justify-start ${
                              isActive 
                                ? 'bg-primary text-primary-foreground' 
                                : 'text-foreground hover:bg-accent'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {tool.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Settings */}
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-foreground">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </>
  );
}
