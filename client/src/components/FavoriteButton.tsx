import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  toolId: string;
  className?: string;
  showLabel?: boolean;
}

export function FavoriteButton({ toolId, className, showLabel = false }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isToggling } = useFavorites();
  const isFav = isFavorite(toolId);

  return (
    <Button
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      className={cn(
        "group relative",
        className
      )}
      onClick={() => toggleFavorite(toolId)}
      disabled={isToggling}
    >
      <motion.div
        animate={{
          scale: isFav ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Star 
          className={cn(
            "h-5 w-5 transition-all",
            isFav 
              ? "fill-yellow-500 text-yellow-500" 
              : "text-muted-foreground group-hover:text-yellow-500"
          )}
        />
      </motion.div>
      
      {showLabel && (
        <span className="ml-2">
          {isFav ? "Remove from favorites" : "Add to favorites"}
        </span>
      )}

      {/* Sparkle effect when favoriting */}
      {isFav && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 w-1 h-1 bg-yellow-400 rounded-full"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos(i * 60 * Math.PI / 180) * 20,
                y: Math.sin(i * 60 * Math.PI / 180) * 20,
                opacity: 0
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}
    </Button>
  );
}