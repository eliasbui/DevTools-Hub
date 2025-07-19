import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { generateUUID } from '@/utils/generators';
import { Fingerprint } from 'lucide-react';

export function UUIDGenerator() {
  const [version, setVersion] = useState<'v1' | 'v4'>('v4');
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);

  const handleGenerate = () => {
    const generated = [];
    for (let i = 0; i < count; i++) {
      generated.push(generateUUID(version));
    }
    setUuids(generated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Fingerprint className="w-5 h-5 text-primary" />
          <span>UUID Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Options */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Version:</label>
              <Select value={version} onValueChange={setVersion}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">v1</SelectItem>
                  <SelectItem value="v4">v4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Count:</label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="100"
                className="w-20"
              />
            </div>
            <Button onClick={handleGenerate} size="sm">
              Generate
            </Button>
          </div>

          {/* Generated UUIDs */}
          {uuids.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generated UUIDs</h3>
              <div className="space-y-2">
                {uuids.map((uuid, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <span className="font-mono text-sm">{uuid}</span>
                    <CopyButton text={uuid} />
                  </div>
                ))}
              </div>
              
              {/* Copy All Button */}
              {uuids.length > 1 && (
                <div className="flex justify-center">
                  <CopyButton 
                    text={uuids.join('\n')} 
                    variant="outline"
                    size="default"
                  />
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>UUID v1:</strong> Timestamp-based, contains MAC address</p>
            <p><strong>UUID v4:</strong> Random/pseudo-random, most commonly used</p>
          </div>
        </div>
      </CardContent>
      
      {/* Description Section */}
      <div className="border-t p-6 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-4">
          <h3 className="text-lg font-semibold">About UUID Generator</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Generate Universally Unique Identifiers (UUIDs) for your applications. UUIDs are 128-bit numbers used to uniquely identify information in computer systems without requiring a central authority.
            </p>
            <p>
              <strong>UUID Versions:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>UUID v1:</strong> Time-based, includes timestamp and MAC address. Good for distributed systems where ordering matters</li>
              <li><strong>UUID v4:</strong> Random generation, most commonly used. Provides 122 bits of randomness</li>
            </ul>
            <p>
              <strong>Common Use Cases:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Database primary keys without auto-increment</li>
              <li>Tracking unique sessions or transactions</li>
              <li>File naming to avoid collisions</li>
              <li>API tokens and temporary identifiers</li>
              <li>Distributed system entity identification</li>
            </ul>
            <p className="text-xs">
              <strong>Note:</strong> UUID v4 is recommended for most use cases as it doesn't expose system information like MAC addresses. The probability of generating duplicate UUID v4s is negligible.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
