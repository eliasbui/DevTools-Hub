import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import * as yaml from 'js-yaml';

export function YAMLConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [inputFormat, setInputFormat] = useState('yaml');
  const [outputFormat, setOutputFormat] = useState('json');
  const [error, setError] = useState('');

  const convertData = () => {
    setError('');
    setOutput('');

    try {
      let data: any;

      // Parse input based on format
      switch (inputFormat) {
        case 'yaml':
          data = yaml.load(input);
          break;
        case 'json':
          data = JSON.parse(input);
          break;
        case 'xml':
          // Simple XML to object conversion
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(input, 'text/xml');
          if (xmlDoc.documentElement.nodeName === 'parsererror') {
            throw new Error('Invalid XML');
          }
          data = xmlToObj(xmlDoc.documentElement);
          break;
        default:
          throw new Error('Invalid input format');
      }

      // Convert to output format
      let result: string;
      switch (outputFormat) {
        case 'yaml':
          result = yaml.dump(data, { indent: 2 });
          break;
        case 'json':
          result = JSON.stringify(data, null, 2);
          break;
        case 'xml':
          result = objToXml(data);
          break;
        default:
          throw new Error('Invalid output format');
      }

      setOutput(result);
    } catch (err: any) {
      setError(err.message || 'Conversion failed');
    }
  };

  // Helper function to convert XML to object
  const xmlToObj = (node: Element): any => {
    const obj: any = {};

    // Handle attributes
    if (node.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        obj['@attributes'][attr.nodeName] = attr.nodeValue;
      }
    }

    // Handle child nodes
    if (node.hasChildNodes()) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
          const childElement = child as Element;
          const childName = childElement.nodeName;
          
          if (obj[childName]) {
            if (!Array.isArray(obj[childName])) {
              obj[childName] = [obj[childName]];
            }
            obj[childName].push(xmlToObj(childElement));
          } else {
            obj[childName] = xmlToObj(childElement);
          }
        } else if (child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim()) {
          return child.nodeValue.trim();
        }
      }
    }

    return obj;
  };

  // Helper function to convert object to XML
  const objToXml = (obj: any, rootName = 'root'): string => {
    const convert = (data: any, name: string): string => {
      if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        return `<${name}>${data}</${name}>`;
      }

      if (Array.isArray(data)) {
        return data.map(item => convert(item, name)).join('\n');
      }

      if (typeof data === 'object' && data !== null) {
        let xml = `<${name}>`;
        
        // Handle attributes
        if (data['@attributes']) {
          const attrs = Object.entries(data['@attributes'])
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
          xml = `<${name} ${attrs}>`;
        }

        // Handle child elements
        for (const [key, value] of Object.entries(data)) {
          if (key !== '@attributes') {
            xml += '\n  ' + convert(value, key).split('\n').join('\n  ');
          }
        }

        xml += `\n</${name}>`;
        return xml;
      }

      return '';
    };

    return '<?xml version="1.0" encoding="UTF-8"?>\n' + convert(obj, rootName);
  };

  const handleSwapFormats = () => {
    setInputFormat(outputFormat);
    setOutputFormat(inputFormat);
    setInput(output);
    setOutput('');
  };

  const sampleData = {
    yaml: `# Sample YAML
name: DevTools Hub
version: 1.0.0
features:
  - name: Smart Paste
    description: Auto-detect data formats
    enabled: true
  - name: Data Converters
    tools:
      - JSON Formatter
      - Base64 Encoder
      - URL Encoder
settings:
  theme: dark
  analytics: false`,
    json: `{
  "name": "DevTools Hub",
  "version": "1.0.0",
  "features": [
    {
      "name": "Smart Paste",
      "description": "Auto-detect data formats",
      "enabled": true
    },
    {
      "name": "Data Converters",
      "tools": [
        "JSON Formatter",
        "Base64 Encoder",
        "URL Encoder"
      ]
    }
  ],
  "settings": {
    "theme": "dark",
    "analytics": false
  }
}`,
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <name>DevTools Hub</name>
  <version>1.0.0</version>
  <features>
    <feature>
      <name>Smart Paste</name>
      <description>Auto-detect data formats</description>
      <enabled>true</enabled>
    </feature>
    <feature>
      <name>Data Converters</name>
      <tools>
        <tool>JSON Formatter</tool>
        <tool>Base64 Encoder</tool>
        <tool>URL Encoder</tool>
      </tools>
    </feature>
  </features>
  <settings>
    <theme>dark</theme>
    <analytics>false</analytics>
  </settings>
</root>`
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
              <FileText className="w-5 h-5" />
            </motion.div>
            <span>YAML Converter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Selection */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <Select value={inputFormat} onValueChange={setInputFormat}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yaml">YAML</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwapFormats}
              className="animate-pulse-hover w-full sm:w-auto"
            >
              ⇄ Swap
            </Button>
            
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yaml">YAML</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Input/Output Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Input ({inputFormat.toUpperCase()})</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput(sampleData[inputFormat as keyof typeof sampleData])}
                  className="animate-pulse-hover text-xs"
                >
                  Load Sample
                </Button>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter ${inputFormat.toUpperCase()} data...`}
                className="min-h-[250px] md:min-h-[400px] font-mono text-xs md:text-sm smooth-transition focus:scale-[1.02]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Output ({outputFormat.toUpperCase()})</label>
                <AnimatePresence>
                  {output && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <CopyButton text={output} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder="Converted output will appear here..."
                className="min-h-[250px] md:min-h-[400px] font-mono text-xs md:text-sm bg-muted"
              />
            </div>
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

          {/* Convert Button */}
          <div className="flex justify-center">
            <Button 
              onClick={convertData} 
              className="animate-pulse-hover"
              size="sm"
              disabled={!input.trim() || inputFormat === outputFormat}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Convert
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}