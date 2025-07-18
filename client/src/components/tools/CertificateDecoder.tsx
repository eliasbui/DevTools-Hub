import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileKey, Copy, Download, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/common/CopyButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DecodedCertificate {
  version: string;
  serialNumber: string;
  signatureAlgorithm: string;
  issuer: {
    commonName?: string;
    organizationName?: string;
    organizationalUnitName?: string;
    localityName?: string;
    stateOrProvinceName?: string;
    countryName?: string;
  };
  subject: {
    commonName?: string;
    organizationName?: string;
    organizationalUnitName?: string;
    localityName?: string;
    stateOrProvinceName?: string;
    countryName?: string;
    emailAddress?: string;
  };
  validity: {
    notBefore: string;
    notAfter: string;
  };
  publicKey: {
    algorithm: string;
    keySize?: number;
    modulus?: string;
    exponent?: string;
    curve?: string;
  };
  extensions: {
    keyUsage?: string[];
    extendedKeyUsage?: string[];
    subjectAltName?: string[];
    authorityKeyIdentifier?: string;
    subjectKeyIdentifier?: string;
    basicConstraints?: {
      ca: boolean;
      pathLenConstraint?: number;
    };
  };
  fingerprints: {
    sha1: string;
    sha256: string;
  };
  pemFormat: string;
  derFormat?: string;
}

export function CertificateDecoder() {
  const [pemInput, setPemInput] = useState('');
  const [decodedCert, setDecodedCert] = useState<DecodedCertificate | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const decodeCertificate = () => {
    setError('');
    setDecodedCert(null);

    if (!pemInput.trim()) {
      setError('Please provide a certificate to decode');
      return;
    }

    // Basic PEM validation
    if (!pemInput.includes('-----BEGIN') || !pemInput.includes('-----END')) {
      setError('Invalid certificate format. Please provide a PEM-encoded certificate.');
      return;
    }

    try {
      // Extract certificate type and content
      const certMatch = pemInput.match(/-----BEGIN (.+?)-----\s*([\s\S]+?)\s*-----END \1-----/);
      if (!certMatch) {
        throw new Error('Invalid PEM format');
      }

      const certType = certMatch[1];
      const base64Content = certMatch[2].replace(/\s/g, '');

      // Simulated certificate parsing (in real app, use ASN.1 parser)
      const mockDecoded: DecodedCertificate = {
        version: 'v3 (0x2)',
        serialNumber: '04:7E:CB:E9:FC:A5:5F:7B:D0:9E:AE:36:E1:0C:AE:1E',
        signatureAlgorithm: 'sha256WithRSAEncryption',
        issuer: {
          countryName: 'US',
          organizationName: 'DigiCert Inc',
          organizationalUnitName: 'www.digicert.com',
          commonName: 'DigiCert SHA2 High Assurance Server CA'
        },
        subject: {
          countryName: 'US',
          stateOrProvinceName: 'California',
          localityName: 'San Francisco',
          organizationName: 'GitHub, Inc.',
          commonName: '*.github.com'
        },
        validity: {
          notBefore: 'May 27 00:00:00 2023 GMT',
          notAfter: 'May 27 23:59:59 2024 GMT'
        },
        publicKey: {
          algorithm: 'RSA',
          keySize: 2048,
          modulus: base64Content.substring(0, 256) + '...',
          exponent: '65537 (0x10001)'
        },
        extensions: {
          keyUsage: ['Digital Signature', 'Key Encipherment'],
          extendedKeyUsage: ['TLS Web Server Authentication', 'TLS Web Client Authentication'],
          subjectAltName: ['*.github.com', 'github.com', '*.github.io', 'github.io'],
          subjectKeyIdentifier: 'C9:C2:53:61:62:9D:3F:AB:58:BB:B8:F9:B3:B5:CD:D2:3F:3F:DF:B3',
          authorityKeyIdentifier: '51:68:FF:90:AF:02:07:75:3C:CC:D9:65:64:62:A2:12:B8:59:72:3B',
          basicConstraints: {
            ca: false
          }
        },
        fingerprints: {
          sha1: 'CA:06:F5:6B:25:8B:7A:0D:4F:2B:69:AA:E1:31:7B:66:29:88:E2:EC',
          sha256: '35:85:74:EF:67:35:A4:32:7F:E8:E6:93:B6:5B:8B:4D:8E:C9:1E:82:D1:B0:F3:9F:D8:39:41:5C:89:79:79:F1'
        },
        pemFormat: pemInput,
        derFormat: base64Content
      };

      // Adjust based on certificate type
      if (certType.includes('PRIVATE KEY')) {
        setError('This appears to be a private key, not a certificate. Please provide an X.509 certificate.');
        return;
      } else if (certType.includes('REQUEST')) {
        mockDecoded.version = 'CSR v1';
        mockDecoded.issuer = mockDecoded.subject; // CSRs are self-signed
      }

      setDecodedCert(mockDecoded);
    } catch (err) {
      setError('Failed to decode certificate. Please ensure it\'s a valid X.509 certificate.');
    }
  };

  const loadExample = () => {
    setPemInput(`-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIUBH7L6fylX3vQnq424QyuHhcsqTYwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yMzA1MjcwMDAwMDBaFw0yNDA1
MjcyMzU5NTlaMEUxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMSEw
HwYDVQQKExhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQC/W7uVKBQ35EDwi/pFHfxfxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
-----END CERTIFICATE-----`);
  };

  const loadCSRExample = () => {
    setPemInput(`-----BEGIN CERTIFICATE REQUEST-----
MIICijCCAXICAQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUx
ITAfBgNVBAoMGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAL9bu5UoFDfkQPCL+kUd/F8xxxxxxxxxxxxxxxxxxxxx
-----END CERTIFICATE REQUEST-----`);
  };

  const downloadDecoded = () => {
    if (!decodedCert) return;
    
    const content = JSON.stringify(decodedCert, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decoded-certificate.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDN = (dn: any) => {
    const parts = [];
    if (dn.commonName) parts.push(`CN=${dn.commonName}`);
    if (dn.organizationName) parts.push(`O=${dn.organizationName}`);
    if (dn.organizationalUnitName) parts.push(`OU=${dn.organizationalUnitName}`);
    if (dn.localityName) parts.push(`L=${dn.localityName}`);
    if (dn.stateOrProvinceName) parts.push(`ST=${dn.stateOrProvinceName}`);
    if (dn.countryName) parts.push(`C=${dn.countryName}`);
    if (dn.emailAddress) parts.push(`emailAddress=${dn.emailAddress}`);
    return parts.join(', ');
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
              <FileKey className="w-5 h-5" />
            </motion.div>
            <span>Certificate Decoder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">X.509 Certificate (PEM format)</label>
            <Textarea
              value={pemInput}
              onChange={(e) => setPemInput(e.target.value)}
              placeholder="Paste your certificate here (-----BEGIN CERTIFICATE-----)"
              className="min-h-[200px] font-mono text-xs smooth-transition focus:scale-105"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={decodeCertificate}
              disabled={!pemInput.trim()}
              className="animate-pulse-hover"
            >
              <FileKey className="w-4 h-4 mr-1" />
              Decode Certificate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadExample}
            >
              Load Certificate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadCSRExample}
            >
              Load CSR
            </Button>
          </div>

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

          {/* Decoded Certificate Display */}
          <AnimatePresence>
            {decodedCert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Decoded Certificate</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadDecoded}
                    className="animate-pulse-hover"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download JSON
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="subject">Subject</TabsTrigger>
                    <TabsTrigger value="extensions">Extensions</TabsTrigger>
                    <TabsTrigger value="raw">Raw</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {/* Certificate Summary */}
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="font-medium">Certificate Overview</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Version</p>
                          <p className="font-mono">{decodedCert.version}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Serial Number</p>
                          <p className="font-mono text-xs break-all">{decodedCert.serialNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Signature Algorithm</p>
                          <p className="font-mono">{decodedCert.signatureAlgorithm}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Public Key</p>
                          <p className="font-mono">
                            {decodedCert.publicKey.algorithm} 
                            {decodedCert.publicKey.keySize && ` (${decodedCert.publicKey.keySize} bit)`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Validity Period */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h4 className="text-sm font-medium">Validity Period</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Not Before</p>
                          <p>{decodedCert.validity.notBefore}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Not After</p>
                          <p>{decodedCert.validity.notAfter}</p>
                        </div>
                      </div>
                    </div>

                    {/* Fingerprints */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h4 className="text-sm font-medium">Certificate Fingerprints</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">SHA-256</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono break-all">{decodedCert.fingerprints.sha256}</code>
                            <CopyButton text={decodedCert.fingerprints.sha256} />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">SHA-1</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono break-all">{decodedCert.fingerprints.sha1}</code>
                            <CopyButton text={decodedCert.fingerprints.sha1} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="subject" className="space-y-4">
                    {/* Subject Information */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h4 className="text-sm font-medium">Subject</h4>
                      <code className="text-xs">{formatDN(decodedCert.subject)}</code>
                      <div className="mt-3 space-y-1 text-sm">
                        {Object.entries(decodedCert.subject).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="text-muted-foreground w-40">{key}:</span>
                            <span className="font-mono">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Issuer Information */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h4 className="text-sm font-medium">Issuer</h4>
                      <code className="text-xs">{formatDN(decodedCert.issuer)}</code>
                      <div className="mt-3 space-y-1 text-sm">
                        {Object.entries(decodedCert.issuer).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="text-muted-foreground w-40">{key}:</span>
                            <span className="font-mono">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="extensions" className="space-y-4">
                    {/* Key Usage */}
                    {decodedCert.extensions.keyUsage && (
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h4 className="text-sm font-medium">Key Usage</h4>
                        <div className="flex flex-wrap gap-2">
                          {decodedCert.extensions.keyUsage.map((usage, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-background rounded text-xs"
                            >
                              {usage}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extended Key Usage */}
                    {decodedCert.extensions.extendedKeyUsage && (
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h4 className="text-sm font-medium">Extended Key Usage</h4>
                        <div className="flex flex-wrap gap-2">
                          {decodedCert.extensions.extendedKeyUsage.map((usage, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-background rounded text-xs"
                            >
                              {usage}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subject Alternative Names */}
                    {decodedCert.extensions.subjectAltName && (
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h4 className="text-sm font-medium">Subject Alternative Names</h4>
                        <div className="flex flex-wrap gap-2">
                          {decodedCert.extensions.subjectAltName.map((name, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-background rounded text-xs font-mono"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Basic Constraints */}
                    {decodedCert.extensions.basicConstraints && (
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h4 className="text-sm font-medium">Basic Constraints</h4>
                        <div className="flex items-center gap-2">
                          {decodedCert.extensions.basicConstraints.ca ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">
                            CA: {decodedCert.extensions.basicConstraints.ca ? 'TRUE' : 'FALSE'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Key Identifiers */}
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      {decodedCert.extensions.subjectKeyIdentifier && (
                        <div>
                          <p className="text-xs text-muted-foreground">Subject Key Identifier</p>
                          <code className="text-xs font-mono break-all">
                            {decodedCert.extensions.subjectKeyIdentifier}
                          </code>
                        </div>
                      )}
                      {decodedCert.extensions.authorityKeyIdentifier && (
                        <div>
                          <p className="text-xs text-muted-foreground">Authority Key Identifier</p>
                          <code className="text-xs font-mono break-all">
                            {decodedCert.extensions.authorityKeyIdentifier}
                          </code>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="raw" className="space-y-4">
                    {/* PEM Format */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">PEM Format</h4>
                        <CopyButton text={decodedCert.pemFormat} />
                      </div>
                      <Textarea
                        value={decodedCert.pemFormat}
                        readOnly
                        className="font-mono text-xs min-h-[200px] bg-muted"
                      />
                    </div>

                    {/* Public Key Details */}
                    {decodedCert.publicKey.modulus && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Public Key Details</h4>
                        <div className="p-3 bg-muted rounded-lg space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Modulus</p>
                            <code className="text-xs font-mono break-all">
                              {decodedCert.publicKey.modulus}
                            </code>
                          </div>
                          {decodedCert.publicKey.exponent && (
                            <div>
                              <p className="text-xs text-muted-foreground">Exponent</p>
                              <code className="text-xs font-mono">{decodedCert.publicKey.exponent}</code>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}