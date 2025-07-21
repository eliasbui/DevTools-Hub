import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Moon, Sun, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
  onMenuClick: () => void;
  toolId?: string;
}

export function Header({ title, description, onMenuClick, toolId }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {toolId && (
            <FavoriteButton toolId={toolId} showLabel={false} />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hover:bg-accent"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
