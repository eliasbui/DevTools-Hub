import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { formatJSON, minifyJSON, validateJSON } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Code, CheckCircle, AlertCircle, History, Save } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useToolData } from '@/hooks/useToolData';

export function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();
  
  // Check if we should load data from history
  const searchParams = new URLSearchParams(window.location.search);
  const loadFromHistory = searchParams.get('loadData') === 'true';
  
  // Load saved data if coming from recent activity
  const { savedData, isLoading } = useToolData('json-formatter', loadFromHistory);
  
  // Auto-save hook
  const { triggerSave, isSaving } = useAutoSave({
    toolId: 'json-formatter',
    toolName: 'JSON Formatter',
    getData: () => ({ input, output }),
  });
  
  // Load saved data when available
  useEffect(() => {
    if (savedData && loadFromHistory) {
      setInput(savedData.input || '');
      setOutput(savedData.output || '');
      toast({
        title: "Data Loaded",
        description: "Previous data has been loaded",
      });
    }
  }, [savedData, loadFromHistory]);

  const handleFormat = () => {
    try {
      const formatted = formatJSON(input);
      setOutput(formatted);
      setIsValid(true);
      setError('');
      triggerSave(); // Auto-save after formatting
    } catch (e) {
      setError((e as Error).message);
      setIsValid(false);
      toast({
        title: "Format Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleMinify = () => {
    try {
      const minified = minifyJSON(input);
      setOutput(minified);
      setIsValid(true);
      setError('');
      triggerSave(); // Auto-save after minifying
    } catch (e) {
      setError((e as Error).message);
      setIsValid(false);
      toast({
        title: "Minify Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleValidate = () => {
    const result = validateJSON(input);
    setIsValid(result.valid);
    setError(result.error || '');
    
    if (result.valid) {
      toast({
        title: "Valid JSON",
        description: "Your JSON is valid!",
      });
    } else {
      toast({
        title: "Invalid JSON",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-primary" />
            <span>JSON Formatter</span>
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Save className="w-4 h-4 animate-pulse" />
              <span>Saving...</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium">JSON Input</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className="min-h-[250px] md:min-h-[400px] font-mono text-xs md:text-sm"
            />
            <div className="flex gap-2 justify-center md:justify-start">
              <Button onClick={handleFormat} size="sm">
                Format
              </Button>
              <Button onClick={handleMinify} size="sm" variant="outline">
                Minify
              </Button>
              <Button onClick={handleValidate} size="sm" variant="outline">
                Validate
              </Button>
            </div>
            
            {/* Validation Status */}
            {input && (
              <div className={`flex items-center space-x-2 p-2 rounded ${
                isValid ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                {isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {isValid ? 'Valid JSON' : error}
                </span>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Formatted Output</label>
              {output && <CopyButton text={output} />}
            </div>
            <div className="min-h-[250px] md:min-h-[400px] p-3 md:p-4 border rounded-lg bg-muted/50 overflow-auto">
              {output ? (
                <pre className="font-mono text-xs md:text-sm whitespace-pre-wrap text-foreground">
                  {output}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-xs md:text-sm text-muted-foreground text-center p-4">
                  Click Format or Minify to see output
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
