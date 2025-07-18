import { ReactElement, cloneElement, useEffect } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useToolData } from '@/hooks/useToolData';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface ToolWrapperProps {
  toolId: string;
  toolName: string;
  children: ReactElement;
  getData: () => any;
  onDataLoaded?: (data: any) => void;
}

export function ToolWrapper({ 
  toolId, 
  toolName, 
  children, 
  getData,
  onDataLoaded 
}: ToolWrapperProps) {
  const { toast } = useToast();
  
  // Check if we should load data from history
  const searchParams = new URLSearchParams(window.location.search);
  const loadFromHistory = searchParams.get('loadData') === 'true';
  
  // Load saved data if coming from recent activity
  const { savedData, isLoading } = useToolData(toolId, loadFromHistory);
  
  // Auto-save hook
  const { triggerSave, isSaving } = useAutoSave({
    toolId,
    toolName,
    getData,
  });

  // Load saved data when available
  useEffect(() => {
    if (savedData && loadFromHistory && onDataLoaded) {
      onDataLoaded(savedData);
      toast({
        title: "Data Loaded",
        description: "Previous data has been loaded",
      });
    }
  }, [savedData, loadFromHistory]);

  // Clone element and pass props
  return cloneElement(children, {
    onAction: (callback?: () => void) => {
      if (callback) callback();
      triggerSave();
    },
    saveIndicator: isSaving && (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Save className="w-4 h-4 animate-pulse" />
        <span>Saving...</span>
      </div>
    ),
  });
}