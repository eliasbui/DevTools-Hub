import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useClipboard() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const copy = async (text: string) => {
    setIsLoading(true);
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { copy, isLoading };
}
