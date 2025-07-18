import type { Express } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { insertFavoriteSchema } from '@shared/schema';

export function registerFavoritesRoutes(app: Express) {
  // Get user's favorites
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: 'Failed to fetch favorites' });
    }
  });

  // Add to favorites
  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { toolId } = req.body;

      if (!toolId) {
        return res.status(400).json({ message: 'Tool ID is required' });
      }

      // Check if already favorited
      const existing = await storage.getFavorites(userId);
      if (existing.some(fav => fav.toolId === toolId)) {
        return res.status(400).json({ message: 'Tool already in favorites' });
      }

      const favoriteData = insertFavoriteSchema.parse({
        userId,
        toolId
      });

      const favorite = await storage.addFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ message: 'Failed to add favorite' });
    }
  });

  // Remove from favorites
  app.delete('/api/favorites/:toolId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { toolId } = req.params;

      const success = await storage.removeFavorite(userId, toolId);
      if (!success) {
        return res.status(404).json({ message: 'Favorite not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ message: 'Failed to remove favorite' });
    }
  });
}