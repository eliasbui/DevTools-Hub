import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Unlock, Key, Copy, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/common/CopyButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type EncryptionAlgorithm = 'aes-256' | 'aes-128' | 'des' | 'triple-des' | 'rsa';
type EncryptionMode = 'CBC' | 'ECB' | 'CTR' | 'GCM';
type OutputFormat = 'base64' | 'hex';

interface EncryptionResult {
  output: string;
  iv?: string;
  salt?: string;
  format: OutputFormat;
}

export function EncryptionTools() {
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [password, setPassword] = useState('');
  const [algorithm, setAlgorithm] = useState<EncryptionAlgorithm>('aes-256');
  const [mode, setMode] = useState<EncryptionMode>('CBC');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('base64');
  const [encryptionResult, setEncryptionResult] = useState<EncryptionResult | null>(null);
  const [decryptionResult, setDecryptionResult] = useState('');
  const [error, setError] = useState('');
  
  // RSA specific
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [keySize, setKeySize] = useState('2048');

  const isSymmetricAlgorithm = () => !algorithm.includes('rsa');

  const generateRandomKey = () => {
    const length = algorithm.includes('256') ? 32 : algorithm.includes('128') ? 16 : 8;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < length; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(key);
  };

  const generateRSAKeyPair = () => {
    // Simulated RSA key generation (in real app, use crypto library)
    const mockPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${btoa(Math.random().toString()).substring(0, 300)}
-----END PUBLIC KEY-----`;
    
    const mockPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC${btoa(Math.random().toString()).substring(0, 300)}
-----END PRIVATE KEY-----`;
    
    setPublicKey(mockPublicKey);
    setPrivateKey(mockPrivateKey);
  };

  const encrypt = () => {
    setError('');
    setEncryptionResult(null);

    if (!plaintext) {
      setError('Please enter text to encrypt');
      return;
    }

    if (isSymmetricAlgorithm() && !password) {
      setError('Please enter a password/key');
      return;
    }

    if (!isSymmetricAlgorithm() && !publicKey) {
      setError('Please provide a public key for RSA encryption');
      return;
    }

    try {
      // Simulated encryption (in real app, use crypto library)
      const timestamp = Date.now().toString();
      const mockIV = btoa(timestamp).substring(0, 16);
      const mockSalt = btoa(timestamp + 'salt').substring(0, 8);
      
      let encrypted = '';
      const input = plaintext + password + algorithm + mode;
      
      if (outputFormat === 'base64') {
        encrypted = btoa(input);
      } else {
        encrypted = Array.from(input).map(char => 
          char.charCodeAt(0).toString(16).padStart(2, '0')
        ).join('');
      }

      const result: EncryptionResult = {
        output: encrypted,
        format: outputFormat
      };

      if (mode !== 'ECB' && isSymmetricAlgorithm()) {
        result.iv = mockIV;
      }

      if (algorithm.includes('aes')) {
        result.salt = mockSalt;
      }

      setEncryptionResult(result);
    } catch (err) {
      setError('Encryption failed. Please check your inputs.');
    }
  };

  const decrypt = () => {
    setError('');
    setDecryptionResult('');

    if (!ciphertext) {
      setError('Please enter ciphertext to decrypt');
      return;
    }

    if (isSymmetricAlgorithm() && !password) {
      setError('Please enter the password/key used for encryption');
      return;
    }

    if (!isSymmetricAlgorithm() && !privateKey) {
      setError('Please provide a private key for RSA decryption');
      return;
    }

    try {
      // Simulated decryption (in real app, use crypto library)
      let decrypted = '';
      
      if (outputFormat === 'base64') {
        try {
          decrypted = atob(ciphertext);
          // Extract original plaintext (mock logic)
          decrypted = decrypted.split(password)[0] || 'Decrypted text';
        } catch {
          decrypted = 'Invalid ciphertext or wrong password';
        }
      } else {
        // Hex to string
        const hex = ciphertext.match(/.{2}/g) || [];
        decrypted = hex.map(h => String.fromCharCode(parseInt(h, 16))).join('');
        decrypted = decrypted.split(password)[0] || 'Decrypted text';
      }

      setDecryptionResult(decrypted);
    } catch (err) {
      setError('Decryption failed. Please check your inputs and ensure the correct algorithm/key is used.');
    }
  };

  const loadExample = () => {
    setPlaintext('Hello World! This is a secret message.');
    setPassword('MySecretPassword123');
    setAlgorithm('aes-256');
    setMode('CBC');
    setOutputFormat('base64');
  };

  const loadRSAExample = () => {
    setPlaintext('Confidential data to encrypt with RSA');
    generateRSAKeyPair();
    setAlgorithm('rsa');
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
              <Lock className="w-5 h-5" />
            </motion.div>
            <span>Encryption/Decryption Tools</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="encrypt" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encrypt">
                <Lock className="w-4 h-4 mr-1" />
                Encrypt
              </TabsTrigger>
              <TabsTrigger value="decrypt">
                <Unlock className="w-4 h-4 mr-1" />
                Decrypt
              </TabsTrigger>
            </TabsList>

            {/* Algorithm Selection */}
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Algorithm</label>
                  <Select value={algorithm} onValueChange={(value: EncryptionAlgorithm) => setAlgorithm(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aes-256">AES-256</SelectItem>
                      <SelectItem value="aes-128">AES-128</SelectItem>
                      <SelectItem value="des">DES</SelectItem>
                      <SelectItem value="triple-des">3DES (Triple DES)</SelectItem>
                      <SelectItem value="rsa">RSA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isSymmetricAlgorithm() && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mode</label>
                    <Select value={mode} onValueChange={(value: EncryptionMode) => setMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBC">CBC</SelectItem>
                        <SelectItem value="ECB">ECB</SelectItem>
                        <SelectItem value="CTR">CTR</SelectItem>
                        <SelectItem value="GCM">GCM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Output Format</label>
                  <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base64">Base64</SelectItem>
                      <SelectItem value="hex">Hexadecimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Key Management */}
              {isSymmetricAlgorithm() ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password/Key</label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter encryption key"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateRandomKey}
                      className="animate-pulse-hover"
                    >
                      <Key className="w-4 h-4 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Key length: {algorithm.includes('256') ? '32' : algorithm.includes('128') ? '16' : '8'} characters recommended
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">RSA Key Pair</label>
                    <div className="flex gap-2">
                      <Select value={keySize} onValueChange={setKeySize}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1024">1024 bit</SelectItem>
                          <SelectItem value="2048">2048 bit</SelectItem>
                          <SelectItem value="4096">4096 bit</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateRSAKeyPair}
                        className="animate-pulse-hover"
                      >
                        Generate Keys
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Public Key</label>
                      <Textarea
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                        placeholder="-----BEGIN PUBLIC KEY-----"
                        className="font-mono text-xs h-32"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Private Key</label>
                      <Textarea
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        placeholder="-----BEGIN PRIVATE KEY-----"
                        className="font-mono text-xs h-32"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <TabsContent value="encrypt" className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={isSymmetricAlgorithm() ? loadExample : loadRSAExample}
                className="animate-pulse-hover"
              >
                Load Example
              </Button>

              <div className="space-y-2">
                <label className="text-sm font-medium">Plain Text</label>
                <Textarea
                  value={plaintext}
                  onChange={(e) => setPlaintext(e.target.value)}
                  placeholder="Enter text to encrypt..."
                  className="min-h-[100px] smooth-transition focus:scale-105"
                />
              </div>

              <Button onClick={encrypt} className="w-full animate-pulse-hover">
                <Lock className="w-4 h-4 mr-1" />
                Encrypt
              </Button>

              {/* Encryption Result */}
              <AnimatePresence>
                {encryptionResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Encrypted Output ({encryptionResult.format})</label>
                        <CopyButton text={encryptionResult.output} />
                      </div>
                      <Textarea
                        value={encryptionResult.output}
                        readOnly
                        className="font-mono text-sm min-h-[100px] bg-muted"
                      />
                    </div>

                    {encryptionResult.iv && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Initialization Vector (IV)</label>
                          <CopyButton text={encryptionResult.iv} />
                        </div>
                        <Input value={encryptionResult.iv} readOnly className="font-mono text-sm bg-muted" />
                      </div>
                    )}

                    {encryptionResult.salt && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Salt</label>
                          <CopyButton text={encryptionResult.salt} />
                        </div>
                        <Input value={encryptionResult.salt} readOnly className="font-mono text-sm bg-muted" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="decrypt" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cipher Text</label>
                <Textarea
                  value={ciphertext}
                  onChange={(e) => setCiphertext(e.target.value)}
                  placeholder="Enter encrypted text to decrypt..."
                  className="min-h-[100px] font-mono text-sm smooth-transition focus:scale-105"
                />
              </div>

              <Button onClick={decrypt} className="w-full animate-pulse-hover">
                <Unlock className="w-4 h-4 mr-1" />
                Decrypt
              </Button>

              {/* Decryption Result */}
              <AnimatePresence>
                {decryptionResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Decrypted Text</label>
                      <CopyButton text={decryptionResult} />
                    </div>
                    <Textarea
                      value={decryptionResult}
                      readOnly
                      className="min-h-[100px] bg-muted"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Note */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Note: This is a demonstration tool using simulated encryption. For production use, implement proper cryptographic libraries with secure key management.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}