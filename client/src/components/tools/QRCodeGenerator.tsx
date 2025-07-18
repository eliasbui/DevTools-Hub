import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CopyButton } from '@/components/common/CopyButton';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Download, RefreshCw } from 'lucide-react';

export function QRCodeGenerator() {
  const [content, setContent] = useState('');
  const [qrType, setQrType] = useState<'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi'>('text');
  const [size, setSize] = useState([200]);
  const [errorLevel, setErrorLevel] = useState('M');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [qrData, setQrData] = useState('');
  const { toast } = useToast();

  // Form fields for different QR types
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [phone, setPhone] = useState('');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  const generateQRData = () => {
    let data = '';
    
    switch (qrType) {
      case 'text':
        data = content;
        break;
      case 'url':
        data = url.startsWith('http') ? url : `https://${url}`;
        break;
      case 'email':
        data = `mailto:${email}`;
        if (subject) data += `?subject=${encodeURIComponent(subject)}`;
        if (body) data += `${subject ? '&' : '?'}body=${encodeURIComponent(body)}`;
        break;
      case 'phone':
        data = `tel:${phone}`;
        break;
      case 'sms':
        data = `sms:${smsNumber}`;
        if (smsMessage) data += `?body=${encodeURIComponent(smsMessage)}`;
        break;
      case 'wifi':
        data = `WIFI:T:${wifiSecurity};S:${wifiSSID};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
        break;
    }
    
    setQrData(data);
  };

  // Simple QR code generation using a public API
  const generateQRCode = () => {
    if (!qrData) {
      toast({
        title: "No Data",
        description: "Please enter content to generate QR code",
        variant: "destructive",
      });
      return;
    }

    // Using qr-server.com API for QR code generation
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size[0]}x${size[0]}&data=${encodeURIComponent(qrData)}&color=${foregroundColor.replace('#', '')}&bgcolor=${backgroundColor.replace('#', '')}&ecc=${errorLevel}`;
    
    return qrUrl;
  };

  const downloadQRCode = () => {
    const qrUrl = generateQRCode();
    if (!qrUrl) return;

    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presets = {
    'website': () => {
      setQrType('url');
      setUrl('https://example.com');
      setQrData('https://example.com');
    },
    'email': () => {
      setQrType('email');
      setEmail('contact@example.com');
      setSubject('Hello');
      setBody('Hi there!');
      setQrData('mailto:contact@example.com?subject=Hello&body=Hi%20there!');
    },
    'phone': () => {
      setQrType('phone');
      setPhone('+1-555-123-4567');
      setQrData('tel:+1-555-123-4567');
    },
    'wifi': () => {
      setQrType('wifi');
      setWifiSSID('MyWiFi');
      setWifiPassword('password123');
      setWifiSecurity('WPA');
      setQrData('WIFI:T:WPA;S:MyWiFi;P:password123;H:false;;');
    },
  };

  const applyPreset = (preset: keyof typeof presets) => {
    presets[preset]();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-primary" />
          <span>QR Code Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => applyPreset('website')} variant="outline" size="sm">
              Website
            </Button>
            <Button onClick={() => applyPreset('email')} variant="outline" size="sm">
              Email
            </Button>
            <Button onClick={() => applyPreset('phone')} variant="outline" size="sm">
              Phone
            </Button>
            <Button onClick={() => applyPreset('wifi')} variant="outline" size="sm">
              WiFi
            </Button>
          </div>

          {/* Type Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">QR Code Type</label>
              <Select value={qrType} onValueChange={(value) => setQrType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Plain Text</SelectItem>
                  <SelectItem value="url">Website URL</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="wifi">WiFi Network</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Content Forms */}
            <Tabs value={qrType} onValueChange={(value) => setQrType(value as any)}>
              <TabsContent value="text" className="space-y-2">
                <label className="text-sm font-medium">Text Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter any text..."
                  className="min-h-[100px]"
                />
              </TabsContent>

              <TabsContent value="url" className="space-y-2">
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com or https://example.com"
                />
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject (optional)</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Body (optional)</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Email body"
                    className="min-h-[80px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-555-123-4567"
                />
              </TabsContent>

              <TabsContent value="sms" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={smsNumber}
                    onChange={(e) => setSmsNumber(e.target.value)}
                    placeholder="+1-555-123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message (optional)</label>
                  <Textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Pre-filled SMS message"
                    className="min-h-[80px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="wifi" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Network Name (SSID)</label>
                  <Input
                    value={wifiSSID}
                    onChange={(e) => setWifiSSID(e.target.value)}
                    placeholder="MyWiFi"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="WiFi password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Security</label>
                  <Select value={wifiSecurity} onValueChange={setWifiSecurity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">No Password</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={generateQRData} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>

          {/* Customization */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customization</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-1 sm:col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Size: {size[0]}px</label>
                <Slider
                  value={size}
                  onValueChange={setSize}
                  min={100}
                  max={1000}
                  step={50}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Error Correction</label>
                <Select value={errorLevel} onValueChange={setErrorLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Foreground Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Background Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Preview */}
          {qrData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">QR Code Preview</h3>
                <div className="flex space-x-2">
                  <CopyButton text={qrData} />
                  <Button onClick={downloadQRCode} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 border rounded-lg bg-white">
                  <img
                    src={generateQRCode()}
                    alt="Generated QR Code"
                    className="block"
                    style={{ width: size[0], height: size[0] }}
                  />
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    QR Code Data:
                  </p>
                  <p className="font-mono text-sm bg-muted p-2 rounded max-w-md break-all">
                    {qrData}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Usage Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Error Correction</h4>
                <p className="text-muted-foreground">Higher error correction levels make QR codes more resilient to damage but also larger.</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Size Considerations</h4>
                <p className="text-muted-foreground">Ensure QR codes are large enough to be easily scanned, especially on mobile devices.</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Color Contrast</h4>
                <p className="text-muted-foreground">Maintain good contrast between foreground and background colors for better readability.</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Testing</h4>
                <p className="text-muted-foreground">Always test your QR codes with different devices and apps before final use.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}