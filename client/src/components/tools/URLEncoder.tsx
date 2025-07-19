import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { encodeURL, decodeURL } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'lucide-react';

export function URLEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const { toast } = useToast();

  const handleEncode = () => {
    try {
      const encoded = encodeURL(input);
      setOutput(encoded);
      setMode('encode');
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
      const decoded = decodeURL(input);
      setOutput(decoded);
      setMode('decode');
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
        <CardTitle className="flex items-center space-x-2">
          <Link className="w-5 h-5 text-primary" />
          <span>URL Encoder/Decoder</span>
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
              placeholder="Enter URL to encode or encoded URL to decode..."
              className="min-h-[200px] md:min-h-[300px] font-mono text-xs md:text-sm"
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
          <h3 className="text-lg font-semibold">About URL Encoder/Decoder</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Encode and decode URLs to ensure safe transmission of data in web applications. URL encoding replaces unsafe ASCII characters with a "%" followed by two hexadecimal digits.
            </p>
            <p>
              <strong>When to Use URL Encoding:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Passing data in URL query parameters</li>
              <li>Handling special characters in URLs (spaces, &, =, ?, etc.)</li>
              <li>Encoding form data for HTTP requests</li>
              <li>Working with international characters in URLs</li>
              <li>Building dynamic links with user-generated content</li>
            </ul>
            <p>
              <strong>Common Encoded Characters:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Space → %20 or +</li>
              <li>& → %26</li>
              <li>= → %3D</li>
              <li>? → %3F</li>
              <li># → %23</li>
            </ul>
            <p className="text-xs">
              <strong>Tip:</strong> Always encode user input before including it in URLs to prevent breaking the URL structure and potential security issues.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
