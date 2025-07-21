import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

interface FavoriteData {
  userId: string;
  toolId: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['/api/favorites', user?.id],
    enabled: !!user,
  });

  // Add to favorites
  const addFavorite = useMutation({
    mutationFn: async (toolId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const data: FavoriteData = {
        userId: user.id,
        toolId
      };
      
      return apiRequest('POST', '/api/favorites', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to favorites",
        description: "Tool has been added to your favorites"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive"
      });
    }
  });

  // Remove from favorites
  const removeFavorite = useMutation({
    mutationFn: async (toolId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      return apiRequest('DELETE', `/api/favorites/${toolId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: "Tool has been removed from your favorites"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive"
      });
    }
  });

  // Toggle favorite
  const toggleFavorite = async (toolId: string) => {
    const isFavorite = favorites.some((fav: any) => fav.toolId === toolId);
    
    if (isFavorite) {
      await removeFavorite.mutateAsync(toolId);
    } else {
      await addFavorite.mutateAsync(toolId);
    }
  };

  // Check if tool is favorited
  const isFavorite = (toolId: string) => {
    return favorites.some((fav: any) => fav.toolId === toolId);
  };

  return {
    favorites,
    isLoading,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    toggleFavorite,
    isFavorite,
    isToggling: addFavorite.isPending || removeFavorite.isPending
  };
}