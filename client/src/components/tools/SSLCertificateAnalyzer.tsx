import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertCircle, CheckCircle2, Clock, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CertificateInfo {
  subject: {
    commonName: string;
    organization?: string;
    country?: string;
  };
  issuer: {
    commonName: string;
    organization?: string;
  };
  validity: {
    notBefore: Date;
    notAfter: Date;
    daysRemaining: number;
  };
  serialNumber: string;
  signatureAlgorithm: string;
  keyInfo: {
    algorithm: string;
    keySize: number;
  };
  sanList: string[];
  fingerprints: {
    sha256: string;
    sha1: string;
  };
  chain: {
    length: number;
    isValid: boolean;
  };
}

export function SSLCertificateAnalyzer() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState('');
  const [pemCert, setPemCert] = useState('');

  const analyzeDomain = async () => {
    if (!domain) return;
    
    setLoading(true);
    setError('');
    setCertInfo(null);

    // Simulate certificate analysis (in real app, this would call a backend API)
    setTimeout(() => {
      try {
        // Simulated certificate data
        const mockCert: CertificateInfo = {
          subject: {
            commonName: domain,
            organization: 'Example Organization',
            country: 'US'
          },
          issuer: {
            commonName: 'Let\'s Encrypt Authority X3',
            organization: 'Let\'s Encrypt'
          },
          validity: {
            notBefore: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            notAfter: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
            daysRemaining: 60
          },
          serialNumber: '03:AC:5C:2F:64:C2:4B:3A:1C:89:95:75:7C:63:10:B4:7D:4C',
          signatureAlgorithm: 'SHA256withRSA',
          keyInfo: {
            algorithm: 'RSA',
            keySize: 2048
          },
          sanList: [domain, `www.${domain}`, `*.${domain}`],
          fingerprints: {
            sha256: 'E9:2F:47:B8:4B:9C:1F:8E:3D:7E:A4:5C:62:D9:B7:F1:56:93:C8:2B:4E:57:D6:7F:A8:3B:42:89:CD:EB:2C:45',
            sha1: 'DA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09'
          },
          chain: {
            length: 3,
            isValid: true
          }
        };
        
        setCertInfo(mockCert);
      } catch (err) {
        setError('Failed to analyze certificate. Please check the domain and try again.');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const decodePEMCertificate = () => {
    if (!pemCert) return;
    
    setLoading(true);
    setError('');
    setCertInfo(null);

    try {
      // Basic PEM validation
      if (!pemCert.includes('-----BEGIN CERTIFICATE-----') || !pemCert.includes('-----END CERTIFICATE-----')) {
        throw new Error('Invalid PEM format');
      }

      // Extract base64 content
      const base64 = pemCert
        .replace(/-----BEGIN CERTIFICATE-----/g, '')
        .replace(/-----END CERTIFICATE-----/g, '')
        .replace(/\s/g, '');

      // Simulate parsing (in real app, would use a proper X.509 parser)
      const mockParsedCert: CertificateInfo = {
        subject: {
          commonName: 'example.com',
          organization: 'Parsed Organization',
          country: 'US'
        },
        issuer: {
          commonName: 'DigiCert SHA2 Secure Server CA',
          organization: 'DigiCert Inc'
        },
        validity: {
          notBefore: new Date('2024-01-01'),
          notAfter: new Date('2025-01-01'),
          daysRemaining: Math.floor((new Date('2025-01-01').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        },
        serialNumber: '01:23:45:67:89:AB:CD:EF',
        signatureAlgorithm: 'SHA256withRSA',
        keyInfo: {
          algorithm: 'RSA',
          keySize: 2048
        },
        sanList: ['example.com', 'www.example.com'],
        fingerprints: {
          sha256: base64.substring(0, 64).match(/.{2}/g)?.join(':') || '',
          sha1: base64.substring(0, 40).match(/.{2}/g)?.join(':') || ''
        },
        chain: {
          length: 1,
          isValid: true
        }
      };

      setCertInfo(mockParsedCert);
    } catch (err) {
      setError('Invalid certificate format. Please provide a valid PEM-encoded certificate.');
    } finally {
      setLoading(false);
    }
  };

  const getValidityStatus = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return { color: 'text-destructive', icon: AlertCircle, text: 'Expired' };
    } else if (daysRemaining < 30) {
      return { color: 'text-warning', icon: AlertCircle, text: 'Expiring Soon' };
    } else {
      return { color: 'text-success', icon: CheckCircle2, text: 'Valid' };
    }
  };

  const loadExample = () => {
    setDomain('github.com');
  };

  const loadPEMExample = () => {
    setPemCert(`-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIUALte/nkPuC9vCGJIebNe6MvqnPcwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNDAxMDEwMDAwMDBaFw0yNTAx
MDEwMDAwMDBaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggIiMA0GCSqGSIb3DQEB
AQUAA4ICDwAwggIKAoICAQC7W3p4D8kgDkJa7Y3p6QZoJ8p0
-----END CERTIFICATE-----`);
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
              <Shield className="w-5 h-5" />
            </motion.div>
            <span>SSL Certificate Analyzer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="domain" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="domain">Analyze Domain</TabsTrigger>
              <TabsTrigger value="pem">Decode PEM</TabsTrigger>
            </TabsList>

            <TabsContent value="domain" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter domain (e.g., github.com)"
                  onKeyPress={(e) => e.key === 'Enter' && analyzeDomain()}
                />
                <Button
                  onClick={analyzeDomain}
                  disabled={loading || !domain}
                  className="animate-pulse-hover"
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadExample}
                >
                  Example
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="pem" className="space-y-4">
              <div className="space-y-2">
                <textarea
                  value={pemCert}
                  onChange={(e) => setPemCert(e.target.value)}
                  placeholder="Paste PEM-encoded certificate here..."
                  className="w-full h-40 p-3 text-sm font-mono border rounded-md bg-background"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={decodePEMCertificate}
                    disabled={loading || !pemCert}
                    className="animate-pulse-hover"
                  >
                    {loading ? 'Decoding...' : 'Decode Certificate'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadPEMExample}
                  >
                    Example
                  </Button>
                </div>
              </div>
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

          {/* Certificate Information */}
          <AnimatePresence>
            {certInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Subject Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Certificate Subject
                  </h3>
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Common Name:</span>{' '}
                      <span className="font-medium">{certInfo.subject.commonName}</span>
                    </div>
                    {certInfo.subject.organization && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Organization:</span>{' '}
                        {certInfo.subject.organization}
                      </div>
                    )}
                    {certInfo.subject.country && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Country:</span>{' '}
                        {certInfo.subject.country}
                      </div>
                    )}
                  </div>
                </div>

                {/* Validity */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Validity Period
                  </h3>
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Valid From:</span>{' '}
                      {certInfo.validity.notBefore.toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Valid Until:</span>{' '}
                      {certInfo.validity.notAfter.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const status = getValidityStatus(certInfo.validity.daysRemaining);
                        const Icon = status.icon;
                        return (
                          <>
                            <Icon className={`w-4 h-4 ${status.color}`} />
                            <span className={`text-sm font-medium ${status.color}`}>
                              {status.text} ({certInfo.validity.daysRemaining} days remaining)
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Issuer */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Certificate Issuer</h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Issued by:</span>{' '}
                      <span className="font-medium">{certInfo.issuer.commonName}</span>
                    </div>
                    {certInfo.issuer.organization && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Organization:</span>{' '}
                        {certInfo.issuer.organization}
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Technical Details</h3>
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Serial Number:</span>{' '}
                      <span className="font-mono text-xs">{certInfo.serialNumber}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Signature Algorithm:</span>{' '}
                      {certInfo.signatureAlgorithm}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Public Key:</span>{' '}
                      {certInfo.keyInfo.algorithm} {certInfo.keyInfo.keySize} bits
                    </div>
                  </div>
                </div>

                {/* SAN List */}
                {certInfo.sanList.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Subject Alternative Names</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {certInfo.sanList.map((san, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-background rounded text-sm"
                          >
                            {san}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fingerprints */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Fingerprints</h3>
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground">SHA-256:</span>
                      <div className="font-mono text-xs mt-1 break-all">
                        {certInfo.fingerprints.sha256}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">SHA-1:</span>
                      <div className="font-mono text-xs mt-1 break-all">
                        {certInfo.fingerprints.sha1}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chain Status */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Certificate Chain
                  </h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      {certInfo.chain.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span className="text-sm">
                        Chain length: {certInfo.chain.length} certificate(s)
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Note */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Note: This is a simulated analyzer. In production, certificate analysis would be performed server-side using proper TLS/SSL libraries.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}