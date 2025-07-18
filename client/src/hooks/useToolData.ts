import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export function useToolData(toolId: string, loadFromHistory: boolean = false) {
  const { isAuthenticated } = useAuth();

  // Fetch latest saved data for this tool
  const { data: savedData, isLoading } = useQuery({
    queryKey: [`/api/saved-data/latest/${toolId}`],
    enabled: isAuthenticated && loadFromHistory,
    retry: false,
  });

  return {
    savedData: savedData?.content,
    isLoading,
  };
}