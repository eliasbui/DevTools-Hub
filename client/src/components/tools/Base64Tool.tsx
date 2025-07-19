import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { encodeBase64, decodeBase64 } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Key, Save } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useToolData } from '@/hooks/useToolData';

interface Base64ToolProps {
  toolId?: string;
  toolName?: string;
}

export function Base64Tool({ toolId = 'base64-tool', toolName = 'Base64 Encoder/Decoder' }: Base64ToolProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
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
    getData: () => ({ input, output, mode }),
  });
  
  // Load saved data when available
  useEffect(() => {
    if (savedData && loadFromHistory) {
      setInput(savedData.input || '');
      setOutput(savedData.output || '');
      setMode(savedData.mode || 'encode');
      toast({
        title: "Data Loaded",
        description: "Previous data has been loaded",
      });
    }
  }, [savedData, loadFromHistory]);

  const handleEncode = () => {
    try {
      const encoded = encodeBase64(input);
      setOutput(encoded);
      setMode('encode');
      triggerSave(); // Auto-save after encoding
    } catch (e) {
      toast({
        title: "Encode Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDecode = () => {
    try {
      const decoded = decodeBase64(input);
      setOutput(decoded);
      setMode('decode');
      triggerSave(); // Auto-save after decoding
    } catch (e) {
      toast({
        title: "Decode Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Input</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encode or Base64 to decode..."
              className="min-h-[200px] md:min-h-[300px] font-mono text-sm"
            />
            <div className="flex gap-2 justify-center md:justify-start">
              <Button onClick={handleEncode} size="sm">
                Encode
              </Button>
              <Button onClick={handleDecode} size="sm" variant="outline">
                Decode
              </Button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Output ({mode === 'encode' ? 'Encoded' : 'Decoded'})
              </label>
              {output && <CopyButton text={output} />}
            </div>
            <div className="min-h-[200px] md:min-h-[300px] p-3 md:p-4 border rounded-lg bg-muted/50 overflow-auto">
              {output ? (
                <pre className="font-mono text-xs md:text-sm whitespace-pre-wrap text-foreground break-all">
                  {output}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-xs md:text-sm text-muted-foreground text-center p-4">
                  Click Encode or Decode to see output
                </div>
              )}
            </div>
          </div>
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
              <strong>Common Use Cases:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Encoding binary data (images, files) for transmission over text-based protocols</li>
              <li>Embedding images directly in HTML/CSS using data URLs</li>
              <li>Encoding credentials for basic authentication headers</li>
              <li>Storing complex data in URL parameters</li>
              <li>Encoding data for JSON/XML payloads</li>
            </ul>
            <p>
              <strong>Features:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Encode:</strong> Convert plain text or binary data to Base64 format</li>
              <li><strong>Decode:</strong> Convert Base64 encoded strings back to original text</li>
              <li><strong>URL-safe option:</strong> Use URL-safe Base64 encoding for web applications</li>
              <li><strong>Auto-save:</strong> Your input is automatically saved for later use</li>
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
