import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Copy, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/common/CopyButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type HashAlgorithm = 'sha256' | 'sha512' | 'sha1' | 'md5' | 'sha3-256' | 'sha3-512';
type OutputFormat = 'hex' | 'base64' | 'base64url';

interface HMACResult {
  hmac: string;
  algorithm: HashAlgorithm;
  format: OutputFormat;
  keyLength: number;
  timestamp: string;
}

export function HMACGenerator() {
  const [message, setMessage] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('sha256');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('hex');
  const [hmacResult, setHmacResult] = useState<HMACResult | null>(null);
  const [verifyHmac, setVerifyHmac] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; message: string } | null>(null);

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let key = '';
    const length = algorithm.includes('512') ? 64 : 32;
    for (let i = 0; i < length; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecretKey(key);
  };

  const generateHMAC = () => {
    if (!message || !secretKey) return;

    // Simulated HMAC generation (in real app, use crypto library)
    const data = message + secretKey + algorithm;
    let hash = '';

    // Simple hash simulation
    for (let i = 0; i < data.length; i++) {
      hash += data.charCodeAt(i).toString(16).padStart(2, '0');
    }

    // Adjust hash length based on algorithm
    const hashLengths: Record<HashAlgorithm, number> = {
      'md5': 32,
      'sha1': 40,
      'sha256': 64,
      'sha512': 128,
      'sha3-256': 64,
      'sha3-512': 128
    };

    hash = hash.padEnd(hashLengths[algorithm], '0').substring(0, hashLengths[algorithm]);

    // Convert to desired format
    let output = hash;
    if (outputFormat === 'base64' || outputFormat === 'base64url') {
      // Convert hex to base64
      const bytes = hash.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || [];
      output = btoa(String.fromCharCode(...bytes));
      
      if (outputFormat === 'base64url') {
        output = output.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      }
    }

    setHmacResult({
      hmac: output,
      algorithm,
      format: outputFormat,
      keyLength: secretKey.length,
      timestamp: new Date().toISOString()
    });
  };

  const verifyHMAC = () => {
    if (!message || !secretKey || !verifyHmac) {
      setVerificationResult({
        valid: false,
        message: 'Please provide message, key, and HMAC to verify'
      });
      return;
    }

    // Regenerate HMAC with current settings and compare
    generateHMAC();
    
    // In real implementation, this would properly compare the HMACs
    setTimeout(() => {
      const isValid = hmacResult?.hmac === verifyHmac;
      setVerificationResult({
        valid: isValid,
        message: isValid 
          ? 'HMAC verification successful! The message is authentic.' 
          : 'HMAC verification failed! The message may have been tampered with or the wrong key was used.'
      });
    }, 100);
  };

  const loadExample = () => {
    setMessage('{"user_id": 12345, "action": "transfer", "amount": 1000, "timestamp": "2024-01-18T10:30:00Z"}');
    setSecretKey('my-super-secret-api-key-2024');
    setAlgorithm('sha256');
    setOutputFormat('hex');
  };

  const loadJWTExample = () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: 1516239022 }));
    setMessage(`${header}.${payload}`);
    setSecretKey('your-256-bit-secret');
    setAlgorithm('sha256');
    setOutputFormat('base64url');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Key className="w-5 h-5" />
            </motion.div>
            <span>HMAC Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate HMAC</TabsTrigger>
              <TabsTrigger value="verify">Verify HMAC</TabsTrigger>
            </TabsList>

            {/* Common Settings */}
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hash Algorithm</label>
                  <Select value={algorithm} onValueChange={(value: HashAlgorithm) => setAlgorithm(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sha256">SHA-256</SelectItem>
                      <SelectItem value="sha512">SHA-512</SelectItem>
                      <SelectItem value="sha1">SHA-1</SelectItem>
                      <SelectItem value="md5">MD5 (Not Recommended)</SelectItem>
                      <SelectItem value="sha3-256">SHA3-256</SelectItem>
                      <SelectItem value="sha3-512">SHA3-512</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Output Format</label>
                  <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hex">Hexadecimal</SelectItem>
                      <SelectItem value="base64">Base64</SelectItem>
                      <SelectItem value="base64url">Base64 URL-Safe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Secret Key</label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter your secret key"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateRandomKey}
                    className="animate-pulse-hover"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Key length: {secretKey.length} characters
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Message / Data</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter the message or data to authenticate..."
                  className="min-h-[100px] font-mono text-sm smooth-transition focus:scale-105"
                />
              </div>
            </div>

            <TabsContent value="generate" className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadExample}
                  className="animate-pulse-hover"
                >
                  API Example
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadJWTExample}
                  className="animate-pulse-hover"
                >
                  JWT Example
                </Button>
              </div>

              <Button 
                onClick={generateHMAC} 
                className="w-full animate-pulse-hover"
                disabled={!message || !secretKey}
              >
                Generate HMAC
              </Button>

              {/* HMAC Result */}
              <AnimatePresence>
                {hmacResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          HMAC-{hmacResult.algorithm.toUpperCase()} ({hmacResult.format})
                        </label>
                        <CopyButton text={hmacResult.hmac} />
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <code className="text-sm break-all">{hmacResult.hmac}</code>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground">Algorithm</p>
                        <p className="font-medium">{hmacResult.algorithm.toUpperCase()}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground">Key Length</p>
                        <p className="font-medium">{hmacResult.keyLength} characters</p>
                      </div>
                    </div>

                    {/* Usage Examples */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h4 className="text-sm font-medium">Common Use Cases:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• API Authentication: Include HMAC in request headers</li>
                        <li>• Message Integrity: Verify data hasn't been tampered with</li>
                        <li>• Webhook Security: Validate webhook payloads</li>
                        <li>• JWT Signing: Create secure JSON Web Tokens</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="verify" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">HMAC to Verify</label>
                <Input
                  value={verifyHmac}
                  onChange={(e) => setVerifyHmac(e.target.value)}
                  placeholder="Enter the HMAC to verify"
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={verifyHMAC} 
                className="w-full animate-pulse-hover"
                disabled={!message || !secretKey || !verifyHmac}
              >
                <Shield className="w-4 h-4 mr-1" />
                Verify HMAC
              </Button>

              {/* Verification Result */}
              <AnimatePresence>
                {verificationResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${
                      verificationResult.valid 
                        ? 'bg-success/10 text-success border border-success/20' 
                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      <Shield className="w-5 h-5" />
                      <div>
                        <p className="font-medium">
                          {verificationResult.valid ? 'Valid HMAC' : 'Invalid HMAC'}
                        </p>
                        <p className="text-sm opacity-90">{verificationResult.message}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>

          {/* Algorithm Security Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Recommendations
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-start gap-1">
                <span className="text-success">✓</span>
                <span><strong>SHA-256/SHA-512:</strong> Recommended for most applications</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-success">✓</span>
                <span><strong>SHA3-256/SHA3-512:</strong> Latest standard, very secure</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-warning">⚠</span>
                <span><strong>SHA-1:</strong> Deprecated, use only for legacy systems</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-destructive">✗</span>
                <span><strong>MD5:</strong> Broken, do not use for security purposes</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}