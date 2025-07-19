import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { generateHash } from '@/utils/generators';
import { Hash } from 'lucide-react';

export function HashGenerator() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'>('SHA-256');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    try {
      const hash = await generateHash(input, algorithm);
      setHashes(prev => ({ ...prev, [algorithm]: hash }));
    } catch (error) {
      console.error('Hash generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    const algorithms: Array<'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'> = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];
    const newHashes: Record<string, string> = {};

    for (const algo of algorithms) {
      try {
        const hash = await generateHash(input, algo);
        newHashes[algo] = hash;
      } catch (error) {
        console.error(`Error generating ${algo} hash:`, error);
      }
    }

    setHashes(newHashes);
    setIsGenerating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Hash className="w-5 h-5 text-primary" />
          <span>Hash Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Input Text</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          {/* Algorithm Selection and Generate Buttons */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Algorithm:</label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MD5">MD5</SelectItem>
                  <SelectItem value="SHA-1">SHA-1</SelectItem>
                  <SelectItem value="SHA-256">SHA-256</SelectItem>
                  <SelectItem value="SHA-512">SHA-512</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating || !input.trim()} size="sm">
              {algorithm}
            </Button>
            <Button onClick={handleGenerateAll} variant="outline" disabled={isGenerating || !input.trim()} size="sm">
              All Hashes
            </Button>
          </div>

          {/* Results */}
          {Object.keys(hashes).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generated Hashes</h3>
              <div className="space-y-3">
                {Object.entries(hashes).map(([algo, hash]) => (
                  <div key={algo} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">{algo}</label>
                      <CopyButton text={hash} />
                    </div>
                    <div className="p-3 border rounded-lg bg-muted/50">
                      <span className="font-mono text-sm break-all">{hash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>MD5:</strong> 128-bit, fast but not cryptographically secure</p>
            <p><strong>SHA-1:</strong> 160-bit, deprecated for security applications</p>
            <p><strong>SHA-256:</strong> 256-bit, recommended for most applications</p>
            <p><strong>SHA-512:</strong> 512-bit, highest security level</p>
          </div>
        </div>
      </CardContent>
      
      {/* Description Section */}
      <div className="border-t p-6 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-4">
          <h3 className="text-lg font-semibold">About Hash Generator</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Generate cryptographic hash values from text input. Hashing is a one-way function that converts data into a fixed-length string of characters, commonly used for data integrity verification and password storage.
            </p>
            <p>
              <strong>Available Algorithms:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>MD5 (128-bit):</strong> Fast but outdated, suitable only for checksums, not security</li>
              <li><strong>SHA-1 (160-bit):</strong> Deprecated for security, still used in legacy systems</li>
              <li><strong>SHA-256 (256-bit):</strong> Current standard for most security applications</li>
              <li><strong>SHA-512 (512-bit):</strong> Maximum security, used for highly sensitive data</li>
            </ul>
            <p>
              <strong>Common Use Cases:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Verify file integrity with checksums</li>
              <li>Create unique identifiers for data</li>
              <li>Store passwords securely (with salt)</li>
              <li>Generate digital signatures</li>
              <li>Detect duplicate content</li>
            </ul>
            <p className="text-xs">
              <strong>Security Note:</strong> For password hashing, always use specialized algorithms like bcrypt, scrypt, or Argon2 instead of general-purpose hash functions.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
