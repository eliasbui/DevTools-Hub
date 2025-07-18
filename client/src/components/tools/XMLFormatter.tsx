import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { FileCode, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

export function XMLFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState('2');
  const [sortAttributes, setSortAttributes] = useState('false');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const formatXML = () => {
    setValidationResult(null);
    setOutput('');

    if (!input.trim()) {
      setValidationResult({
        valid: false,
        message: 'Please enter XML to format'
      });
      return;
    }

    try {
      // Parse XML
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        const errorText = parserError.textContent || 'Invalid XML';
        setValidationResult({
          valid: false,
          message: `XML Parsing Error: ${errorText}`
        });
        return;
      }

      // Format the XML
      const formatted = formatNode(doc.documentElement, 0);
      const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
      const result = xmlDeclaration + '\n' + formatted;

      setOutput(result);
      setValidationResult({
        valid: true,
        message: 'Valid XML'
      });
    } catch (err: any) {
      setValidationResult({
        valid: false,
        message: `Error: ${err.message || 'Unknown error'}`
      });
    }
  };

  const formatNode = (node: Element, level: number): string => {
    const indent = ' '.repeat(parseInt(indentSize) * level);
    const childIndent = ' '.repeat(parseInt(indentSize) * (level + 1));
    
    let result = indent + '<' + node.nodeName;
    
    // Handle attributes
    if (node.attributes.length > 0) {
      const attrs = Array.from(node.attributes);
      
      // Sort attributes if requested
      if (sortAttributes === 'true') {
        attrs.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      attrs.forEach(attr => {
        result += ` ${attr.name}="${escapeXml(attr.value || '')}"`;
      });
    }
    
    // Handle child nodes
    const childNodes = Array.from(node.childNodes).filter(
      child => child.nodeType === Node.ELEMENT_NODE || 
               (child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim())
    );
    
    if (childNodes.length === 0) {
      result += ' />';
    } else {
      result += '>';
      
      // Check if it's a simple text node
      if (childNodes.length === 1 && childNodes[0].nodeType === Node.TEXT_NODE) {
        result += escapeXml(childNodes[0].nodeValue?.trim() || '');
        result += '</' + node.nodeName + '>';
      } else {
        result += '\n';
        
        childNodes.forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            result += formatNode(child as Element, level + 1) + '\n';
          } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.nodeValue?.trim();
            if (text) {
              result += childIndent + escapeXml(text) + '\n';
            }
          }
        });
        
        result += indent + '</' + node.nodeName + '>';
      }
    }
    
    return result;
  };

  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const minifyXML = () => {
    setValidationResult(null);
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');
      
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        setValidationResult({
          valid: false,
          message: 'Invalid XML - cannot minify'
        });
        return;
      }

      const minified = input
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
      
      setOutput(minified);
      setValidationResult({
        valid: true,
        message: 'XML minified successfully'
      });
    } catch (err) {
      setValidationResult({
        valid: false,
        message: 'Failed to minify XML'
      });
    }
  };

  const validateXML = () => {
    setOutput('');
    
    if (!input.trim()) {
      setValidationResult({
        valid: false,
        message: 'Please enter XML to validate'
      });
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');
      
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        const errorText = parserError.textContent || 'Invalid XML';
        setValidationResult({
          valid: false,
          message: `Validation Error: ${errorText}`
        });
      } else {
        // Additional validation checks
        const rootElement = doc.documentElement;
        const elementCount = doc.getElementsByTagName('*').length;
        const attributeCount = doc.evaluate('//@*', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
        
        setValidationResult({
          valid: true,
          message: `Valid XML - Root: <${rootElement.nodeName}>, Elements: ${elementCount}, Attributes: ${attributeCount}`
        });
      }
    } catch (err: any) {
      setValidationResult({
        valid: false,
        message: `Validation Error: ${err.message || 'Unknown error'}`
      });
    }
  };

  const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction" id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price currency="USD">44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book category="fiction" id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price currency="USD">5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies.</description>
  </book>
</bookstore>`;

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
              <FileCode className="w-5 h-5" />
            </motion.div>
            <span>XML Formatter & Validator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Settings */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Indent Size:</label>
              <Select value={indentSize} onValueChange={setIndentSize}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="8">Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort Attributes:</label>
              <Select value={sortAttributes} onValueChange={setSortAttributes}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInput(sampleXML)}
              className="animate-pulse-hover"
            >
              Load Sample
            </Button>
          </div>

          {/* Validation Result */}
          <AnimatePresence>
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant={validationResult.valid ? 'default' : 'destructive'}>
                  {validationResult.valid ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{validationResult.message}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input/Output Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input XML</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter or paste your XML here..."
                className="min-h-[400px] font-mono text-sm smooth-transition focus:scale-105"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Formatted XML</label>
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
                placeholder="Formatted XML will appear here..."
                className="min-h-[400px] font-mono text-sm bg-muted"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={formatXML} 
              className="animate-pulse-hover"
              size="sm"
              disabled={!input.trim()}
            >
              Format
            </Button>
            <Button 
              onClick={minifyXML}
              variant="outline"
              className="animate-pulse-hover"
              size="sm"
              disabled={!input.trim()}
            >
              Minify
            </Button>
            <Button 
              onClick={validateXML}
              variant="outline"
              className="animate-pulse-hover"
              size="sm"
              disabled={!input.trim()}
            >
              Validate
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}