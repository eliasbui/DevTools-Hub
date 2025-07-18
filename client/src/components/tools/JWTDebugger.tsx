import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { parseJWT } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

export function JWTDebugger() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<{ header: any; payload: any; signature: string } | null>(null);
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  const handleDecode = () => {
    try {
      const result = parseJWT(input);
      setDecoded(result);
      setIsValid(true);
    } catch (e) {
      setDecoded(null);
      setIsValid(false);
      toast({
        title: "JWT Decode Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <span>JWT Debugger</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium">JWT Token</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JWT token here..."
              className="min-h-[150px] font-mono text-sm"
            />
            <div className="flex items-center space-x-4">
              <Button onClick={handleDecode} size="sm">
                Decode JWT
              </Button>
              {input && (
                <div className={`flex items-center space-x-2 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isValid ? 'Valid JWT format' : 'Invalid JWT format'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Decoded Sections */}
          {decoded && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Header</label>
                  <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <pre className="font-mono text-sm text-foreground">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Payload</label>
                  <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <pre className="font-mono text-sm text-foreground">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Signature */}
              <div className="space-y-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Signature</label>
                  <CopyButton text={decoded.signature} />
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <pre className="font-mono text-sm text-foreground break-all">
                    {decoded.signature}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
