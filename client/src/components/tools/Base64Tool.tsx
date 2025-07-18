import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { encodeBase64, decodeBase64 } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Key } from 'lucide-react';

export function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const { toast } = useToast();

  const handleEncode = () => {
    try {
      const encoded = encodeBase64(input);
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
      const decoded = decodeBase64(input);
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
          <Key className="w-5 h-5 text-primary" />
          <span>Base64 Encoder/Decoder</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Input</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encode or Base64 to decode..."
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex space-x-2">
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
            <div className="min-h-[300px] p-4 border rounded-lg bg-muted/50 overflow-auto">
              {output ? (
                <pre className="font-mono text-sm whitespace-pre-wrap text-foreground">
                  {output}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Click Encode or Decode to see output
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
