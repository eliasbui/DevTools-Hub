import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Star, ArrowRight, Sparkles, Code } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from 'wouter';
import { getToolById, categories } from '@/lib/toolsData';

export function Favorites() {
  const { favorites, isLoading } = useFavorites();

  // Get tool details from favorites  
  const favoriteTools = favorites.map((fav: any) => {
    const tool = getToolById(fav.toolId);
    
    if (tool) {
      return {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        categoryName: categories[tool.category as keyof typeof categories] || tool.category,
        icon: tool.icon
      };
    }
    
    // Default for tools not found
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
    <Layout title="Favorites">
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