import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { DataDetector } from '@/components/common/DataDetector';
import { detectDataType } from '@/utils/dataDetection';
import { DetectedData } from '@/types/tools';
import { Wand2, Trash2 } from 'lucide-react';

export function SmartPaste() {
  const [input, setInput] = useState('');
  const [detected, setDetected] = useState<DetectedData | null>(null);
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input.trim()) {
      const detection = detectDataType(input);
      setDetected(detection);
      setOutput(detection.formatted || JSON.stringify(detection.data, null, 2));
    } else {
      setDetected(null);
      setOutput('');
    }
  }, [input]);

  const handleClear = () => {
    setInput('');
    setDetected(null);
    setOutput('');
  };

  const getActionButtons = () => {
    if (!detected) return null;

    switch (detected.type) {
      case 'json':
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              Validate
            </Button>
            <Button size="sm" variant="outline">
              Minify
            </Button>
            <Button size="sm" variant="outline">
              Copy Path
            </Button>
          </div>
        );
      case 'jwt':
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              Verify Signature
            </Button>
            <Button size="sm" variant="outline">
              Decode
            </Button>
          </div>
        );
      case 'base64':
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              Encode
            </Button>
            <Button size="sm" variant="outline">
              Decode
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="w-5 h-5 text-primary" />
          <span>Smart Paste</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Auto-detects: JSON, Base64, JWT, URLs, Timestamps, Hex Colors, XML, YAML
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Paste your content here</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClear}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste any content here - JSON, Base64, JWT, URL, timestamp, hex color, etc..."
              className="min-h-[300px] font-mono text-sm"
            />
            <DataDetector detected={detected} />
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Formatted Output</label>
              {output && <CopyButton text={output} />}
            </div>
            <div className="min-h-[300px] p-4 border rounded-lg bg-muted/50 overflow-auto">
              {output ? (
                <pre className="font-mono text-sm whitespace-pre-wrap text-foreground">
                  {output}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Paste content to see formatted output
                </div>
              )}
            </div>
            {getActionButtons()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
