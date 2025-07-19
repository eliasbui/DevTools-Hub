import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { encodeBase64, decodeBase64 } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Key, Save, ArrowLeftRight, Sparkles, AlertCircle, Copy, Trash2 } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useToolData } from '@/hooks/useToolData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Base64ToolProps {
  toolId?: string;
  toolName?: string;
}

// Function to detect if a string is likely Base64 encoded
function isBase64(str: string): { isValid: boolean; confidence: number } {
  if (!str || str.length === 0) return { isValid: false, confidence: 0 };
  
  // Remove whitespace
  const cleaned = str.trim();
  
  // Base64 regex pattern
  const base64Regex = /^[A-Za-z0-9+/]*(={0,2})$/;
  
  // Check if it matches Base64 pattern
  if (!base64Regex.test(cleaned)) return { isValid: false, confidence: 0 };
  
  // Additional checks for confidence
  let confidence = 50; // Base confidence for matching pattern
  
  // Check if length is multiple of 4
  if (cleaned.length % 4 === 0) confidence += 20;
  
  // Check for padding
  if (cleaned.endsWith('=') || cleaned.endsWith('==')) confidence += 10;
  
  // Try to decode
  try {
    const decoded = atob(cleaned);
    if (decoded.length > 0) {
      confidence += 20;
      // Check if decoded content has reasonable characters
      const printableRatio = decoded.split('').filter(char => 
        char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126
      ).length / decoded.length;
      
      if (printableRatio > 0.75) confidence = Math.min(confidence + 10, 100);
    }
    return { isValid: true, confidence };
  } catch {
    return { isValid: false, confidence: 0 };
  }
}

export function Base64Tool({ toolId = 'base64-tool', toolName = 'Base64 Encoder/Decoder' }: Base64ToolProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [detection, setDetection] = useState<{ isValid: boolean; confidence: number }>({ isValid: false, confidence: 0 });
  const [isSwapping, setIsSwapping] = useState(false);
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

  // Auto-detect if input is Base64
  useEffect(() => {
    setDetection(isBase64(input));
  }, [input]);

  const handleSmartAction = () => {
    if (!input.trim()) {
      toast({
        title: "No Input",
        description: "Please enter some text to encode or decode",
        variant: "destructive",
      });
      return;
    }

    try {
      if (detection.isValid && detection.confidence > 60) {
        // Decode
        const decoded = decodeBase64(input);
        setOutput(decoded);
        toast({
          title: "Decoded Successfully",
          description: `Base64 decoded (${detection.confidence}% confidence)`,
        });
      } else {
        // Encode
        const encoded = encodeBase64(input);
        setOutput(encoded);
        toast({
          title: "Encoded Successfully",
          description: "Text encoded to Base64",
        });
      }
      triggerSave(); // Auto-save after action
    } catch (e) {
      toast({
        title: detection.isValid ? "Decode Error" : "Encode Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSwap = () => {
    if (!output) {
      toast({
        title: "No Output",
        description: "Generate some output first before swapping",
        variant: "destructive",
      });
      return;
    }
    
    setIsSwapping(true);
    setTimeout(() => {
      const tempInput = input;
      setInput(output);
      setOutput(tempInput);
      setIsSwapping(false);
      toast({
        title: "Swapped",
        description: "Input and output have been swapped",
      });
    }, 300);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    toast({
      title: "Cleared",
      description: "Input and output have been cleared",
    });
  };

  const getActionButtonText = () => {
    if (!input.trim()) return "Enter text";
    if (detection.isValid && detection.confidence > 60) {
      return `Decode Base64 (${detection.confidence}% sure)`;
    }
    return "Encode to Base64";
  };

  const getActionButtonIcon = () => {
    if (detection.isValid && detection.confidence > 60) {
      return <Key className="w-4 h-4 mr-2 rotate-180" />;
    }
    return <Key className="w-4 h-4 mr-2" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-primary" />
            <span>Base64 Encoder/Decoder</span>
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
        <div className="relative">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <AnimatePresence mode="wait">
              <motion.div
                key="input"
                initial={isSwapping ? { opacity: 0, x: -20 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Input
                    {detection.isValid && detection.confidence > 60 && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        Base64 detected
                      </span>
                    )}
                  </label>
                  {input && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleClear}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Clear all</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste or type text here..."
                  className="min-h-[300px] font-mono text-sm resize-none"
                />
              </motion.div>
            </AnimatePresence>

            {/* Swap Button - Centered between columns */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 lg:block hidden">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full shadow-lg bg-background hover:bg-accent"
                      onClick={handleSwap}
                      disabled={!output || isSwapping}
                    >
                      <motion.div
                        animate={isSwapping ? { rotate: 180 } : { rotate: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowLeftRight className="w-5 h-5" />
                      </motion.div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Swap input and output</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Output Section */}
            <AnimatePresence mode="wait">
              <motion.div
                key="output"
                initial={isSwapping ? { opacity: 0, x: 20 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Output</label>
                  {output && <CopyButton text={output} />}
                </div>
                <div className="min-h-[300px] p-4 border rounded-lg bg-muted/50 overflow-auto">
                  {output ? (
                    <pre className="font-mono text-sm whitespace-pre-wrap break-all">
                      {output}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      Output will appear here
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button
              onClick={handleSmartAction}
              size="lg"
              className="min-w-[200px]"
              disabled={!input.trim()}
            >
              {getActionButtonIcon()}
              {getActionButtonText()}
            </Button>
            
            {/* Mobile swap button */}
            <Button
              variant="outline"
              size="lg"
              className="lg:hidden"
              onClick={handleSwap}
              disabled={!output || isSwapping}
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Swap
            </Button>
          </div>

          {/* Smart Detection Indicator */}
          {input && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                Smart detection: {detection.isValid && detection.confidence > 60 
                  ? `Base64 encoded (${detection.confidence}% confidence)` 
                  : 'Plain text detected'}
              </span>
            </motion.div>
          )}
        </div>
      </CardContent>
      
      {/* Description Section */}
      <div className="border-t p-6 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-4">
          <h3 className="text-lg font-semibold">About Base64 Encoder/Decoder</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Base64 is a binary-to-text encoding scheme that represents binary data in ASCII string format. It's commonly used for encoding data in URLs, emails, and web applications.
            </p>
            <p>
              <strong>Smart Features:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Auto-detection:</strong> Automatically detects if your input is Base64 encoded</li>
              <li><strong>Smart Action Button:</strong> Intelligently switches between encode and decode based on input</li>
              <li><strong>Swap Function:</strong> Quickly exchange input and output with one click</li>
              <li><strong>Confidence Indicator:</strong> Shows how certain the tool is about Base64 detection</li>
            </ul>
            <p>
              <strong>Common Use Cases:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Encoding binary data (images, files) for transmission over text-based protocols</li>
              <li>Embedding images directly in HTML/CSS using data URLs</li>
              <li>Encoding credentials for basic authentication headers</li>
              <li>Storing complex data in URL parameters</li>
              <li>Encoding data for JSON/XML payloads</li>
            </ul>
            <p className="text-xs">
              <strong>Note:</strong> Base64 encoding increases data size by approximately 33%. It's not encryption and should not be used for security purposes.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}