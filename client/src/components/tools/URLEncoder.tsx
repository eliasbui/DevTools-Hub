import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { encodeURL, decodeURL } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Link, Save, ArrowLeftRight, Sparkles, Trash2 } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useToolData } from '@/hooks/useToolData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface URLEncoderProps {
  toolId?: string;
  toolName?: string;
}

// Function to detect if a string is likely URL encoded
function isURLEncoded(str: string): { isValid: boolean; confidence: number } {
  if (!str || str.length === 0) return { isValid: false, confidence: 0 };
  
  // Count encoded patterns
  const encodedPattern = /%[0-9A-Fa-f]{2}/g;
  const matches = str.match(encodedPattern);
  
  if (!matches || matches.length === 0) {
    return { isValid: false, confidence: 0 };
  }
  
  // Calculate confidence based on percentage of encoded characters
  const encodedChars = matches.length * 3; // Each %XX is 3 characters
  const encodedRatio = encodedChars / str.length;
  
  let confidence = 0;
  
  // Common URL encoded patterns
  if (str.includes('%20') || str.includes('%2F') || str.includes('%3A')) {
    confidence += 30;
  }
  
  // Check if decoding results in different text
  try {
    const decoded = decodeURIComponent(str);
    if (decoded !== str) {
      confidence += 40;
      // Check if decoded text makes more sense (has spaces, punctuation, etc.)
      if (decoded.includes(' ') && !str.includes(' ')) confidence += 20;
    }
  } catch {
    // If decoding fails, it might be partially encoded
    confidence += 10;
  }
  
  // Adjust confidence based on encoding ratio
  if (encodedRatio > 0.3) confidence += 10;
  if (encodedRatio > 0.5) confidence += 10;
  
  return {
    isValid: confidence > 30,
    confidence: Math.min(confidence, 100)
  };
}

export function URLEncoder({ toolId = 'url-encoder', toolName = 'URL Encoder/Decoder' }: URLEncoderProps) {
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

  // Auto-detect if input is URL encoded
  useEffect(() => {
    setDetection(isURLEncoded(input));
  }, [input]);

  const handleSmartAction = () => {
    if (!input.trim()) {
      toast({
        title: "No Input",
        description: "Please enter some text or URL to encode or decode",
        variant: "destructive",
      });
      return;
    }

    try {
      if (detection.isValid && detection.confidence > 40) {
        // Decode
        const decoded = decodeURL(input);
        setOutput(decoded);
        toast({
          title: "Decoded Successfully",
          description: `URL decoded (${detection.confidence}% confidence)`,
        });
      } else {
        // Encode
        const encoded = encodeURL(input);
        setOutput(encoded);
        toast({
          title: "Encoded Successfully",
          description: "Text encoded for URL",
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
    if (!input.trim()) return "Enter text or URL";
    if (detection.isValid && detection.confidence > 40) {
      return `Decode URL (${detection.confidence}% sure)`;
    }
    return "Encode for URL";
  };

  const getActionButtonIcon = () => {
    if (detection.isValid && detection.confidence > 40) {
      return <Link className="w-4 h-4 mr-2 rotate-45" />;
    }
    return <Link className="w-4 h-4 mr-2" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link className="w-5 h-5 text-primary" />
            <span>URL Encoder/Decoder</span>
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
                    {detection.isValid && detection.confidence > 40 && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        URL encoded detected
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
                  placeholder="Paste or type text/URL here..."
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
                Smart detection: {detection.isValid && detection.confidence > 40 
                  ? `URL encoded (${detection.confidence}% confidence)` 
                  : 'Plain text detected'}
              </span>
            </motion.div>
          )}
        </div>
      </CardContent>
      
      {/* Description Section */}
      <div className="border-t p-6 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-4">
          <h3 className="text-lg font-semibold">About URL Encoder/Decoder</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              URL encoding converts characters into a format that can be safely transmitted over the Internet. It replaces unsafe ASCII characters with a "%" followed by two hexadecimal digits.
            </p>
            <p>
              <strong>Smart Features:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Auto-detection:</strong> Automatically detects if your input is URL encoded</li>
              <li><strong>Smart Action Button:</strong> Intelligently switches between encode and decode based on input</li>
              <li><strong>Swap Function:</strong> Quickly exchange input and output with one click</li>
              <li><strong>Confidence Indicator:</strong> Shows how certain the tool is about URL encoding detection</li>
            </ul>
            <p>
              <strong>Common Use Cases:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Encoding query parameters in URLs</li>
              <li>Making text safe for use in URL paths</li>
              <li>Encoding form data for HTTP requests</li>
              <li>Decoding URL parameters for debugging</li>
              <li>Preparing data for API calls</li>
            </ul>
            <p>
              <strong>Encoded Characters:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Space → %20</li>
              <li>! → %21</li>
              <li># → %23</li>
              <li>& → %26</li>
              <li>+ → %2B</li>
              <li>/ → %2F</li>
              <li>: → %3A</li>
              <li>= → %3D</li>
              <li>? → %3F</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}