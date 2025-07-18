import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { debounce } from '@/lib/utils';

interface AutoSaveOptions {
  toolId: string;
  toolName: string;
  getData: () => any;
  delay?: number;
}

export function useAutoSave({ toolId, toolName, getData, delay = 2000 }: AutoSaveOptions) {
  const { isAuthenticated } = useAuth();
  const lastSavedDataRef = useRef<string>('');

  const saveMutation = useMutation({
    mutationFn: async (content: any) => {
      await apiRequest('POST', '/api/saved-data', {
        toolId,
        title: `${toolName} - Auto-saved`,
        content,
      });
    },
  });

  const debouncedSave = useRef(
    debounce((data: any) => {
      const dataString = JSON.stringify(data);
      
      // Only save if data has changed
      if (dataString !== lastSavedDataRef.current && isAuthenticated) {
        lastSavedDataRef.current = dataString;
        saveMutation.mutate(data);
      }
    }, delay)
  ).current;

  const triggerSave = () => {
    const data = getData();
    if (data && Object.keys(data).length > 0) {
      debouncedSave(data);
    }
  };

  return {
    triggerSave,
    isSaving: saveMutation.isPending,
    lastSaveError: saveMutation.error,
  };
}