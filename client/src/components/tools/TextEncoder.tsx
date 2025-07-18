import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { FileCode2, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type EncodingType = 'html' | 'url' | 'base64' | 'ascii' | 'unicode' | 'hex' | 'binary';

export function TextEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [encodingType, setEncodingType] = useState<EncodingType>('html');
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');

  const htmlEntities: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '¢': '&cent;',
    '£': '&pound;',
    '¥': '&yen;',
    '€': '&euro;',
    '©': '&copy;',
    '®': '&reg;',
    '™': '&trade;',
    '°': '&deg;',
    '±': '&plusmn;',
    '¼': '&frac14;',
    '½': '&frac12;',
    '¾': '&frac34;',
    '×': '&times;',
    '÷': '&divide;',
    // Removed smart quotes due to encoding issues
    ' ': '&nbsp;',
  };

  const encodeHtml = (text: string): string => {
    return text.replace(/[&<>"'¢£¥€©®™°±¼½¾×÷ ]/g, char => htmlEntities[char] || char);
  };

  const decodeHtml = (text: string): string => {
    const reverseEntities: { [key: string]: string } = {};
    Object.entries(htmlEntities).forEach(([char, entity]) => {
      reverseEntities[entity] = char;
    });
    
    let result = text;
    Object.entries(reverseEntities).forEach(([entity, char]) => {
      result = result.replace(new RegExp(entity, 'g'), char);
    });
    
    // Decode numeric entities
    result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)));
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    
    return result;
  };

  const encodeAscii = (text: string): string => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      return code < 128 ? char : `\\u${code.toString(16).padStart(4, '0')}`;
    }).join('');
  };

  const decodeAscii = (text: string): string => {
    return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
      String.fromCharCode(parseInt(hex, 16))
    );
  };

  const encodeUnicode = (text: string): string => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code < 128) return char;
      return `\\u${code.toString(16).padStart(4, '0')}`;
    }).join('');
  };

  const decodeUnicode = (text: string): string => {
    return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
      String.fromCharCode(parseInt(hex, 16))
    );
  };

  const encodeHex = (text: string): string => {
    return text.split('').map(char => 
      char.charCodeAt(0).toString(16).padStart(2, '0')
    ).join(' ');
  };

  const decodeHex = (text: string): string => {
    const hex = text.replace(/\s/g, '');
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
      result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return result;
  };

  const encodeBinary = (text: string): string => {
    return text.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join(' ');
  };

  const decodeBinary = (text: string): string => {
    return text.split(/\s+/).filter(bin => bin).map(bin => 
      String.fromCharCode(parseInt(bin, 2))
    ).join('');
  };

  const processText = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      let result = '';

      if (direction === 'encode') {
        switch (encodingType) {
          case 'html':
            result = encodeHtml(input);
            break;
          case 'url':
            result = encodeURIComponent(input);
            break;
          case 'base64':
            result = btoa(unescape(encodeURIComponent(input)));
            break;
          case 'ascii':
            result = encodeAscii(input);
            break;
          case 'unicode':
            result = encodeUnicode(input);
            break;
          case 'hex':
            result = encodeHex(input);
            break;
          case 'binary':
            result = encodeBinary(input);
            break;
        }
      } else {
        switch (encodingType) {
          case 'html':
            result = decodeHtml(input);
            break;
          case 'url':
            result = decodeURIComponent(input);
            break;
          case 'base64':
            result = decodeURIComponent(escape(atob(input)));
            break;
          case 'ascii':
            result = decodeAscii(input);
            break;
          case 'unicode':
            result = decodeUnicode(input);
            break;
          case 'hex':
            result = decodeHex(input);
            break;
          case 'binary':
            result = decodeBinary(input);
            break;
        }
      }

      setOutput(result);
    } catch (error) {
      setOutput('Error: Invalid input for selected encoding type');
    }
  };

  const swapValues = () => {
    setInput(output);
    setOutput(input);
    setDirection(direction === 'encode' ? 'decode' : 'encode');
  };

  const sampleTexts = {
    html: '<p>Hello & "World"!</p>',
    url: 'Hello World! @#$%',
    base64: 'Hello, World!',
    ascii: 'Hello 世界!',
    unicode: 'Hello 世界 🌍',
    hex: 'Hello!',
    binary: 'Hi!',
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
              <FileCode2 className="w-5 h-5" />
            </motion.div>
            <span>Text Encoder/Decoder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <Select value={encodingType} onValueChange={(value: EncodingType) => setEncodingType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML Entities</SelectItem>
                <SelectItem value="url">URL Encoding</SelectItem>
                <SelectItem value="base64">Base64</SelectItem>
                <SelectItem value="ascii">ASCII Escape</SelectItem>
                <SelectItem value="unicode">Unicode Escape</SelectItem>
                <SelectItem value="hex">Hexadecimal</SelectItem>
                <SelectItem value="binary">Binary</SelectItem>
              </SelectContent>
            </Select>

            <Select value={direction} onValueChange={(value: 'encode' | 'decode') => setDirection(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="encode">Encode</SelectItem>
                <SelectItem value="decode">Decode</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInput(sampleTexts[encodingType])}
              className="animate-pulse-hover"
            >
              Load Sample
            </Button>
          </div>

          {/* Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Input</label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={swapValues}
                  className="animate-pulse-hover"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter text to ${direction}...`}
                className="min-h-[300px] font-mono text-sm smooth-transition focus:scale-105"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Output</label>
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
                placeholder={`${direction === 'encode' ? 'Encoded' : 'Decoded'} text will appear here...`}
                className="min-h-[300px] font-mono text-sm bg-muted"
              />
            </div>
          </div>

          {/* Process Button */}
          <Button 
            onClick={processText} 
            className="w-full animate-pulse-hover"
            disabled={!input.trim()}
          >
            {direction === 'encode' ? 'Encode' : 'Decode'} Text
          </Button>

          {/* Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="text-sm font-medium">Encoding Types:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>HTML Entities:</strong> Convert special characters to HTML entities</li>
              <li><strong>URL Encoding:</strong> Encode text for use in URLs</li>
              <li><strong>Base64:</strong> Binary-to-text encoding scheme</li>
              <li><strong>ASCII Escape:</strong> Escape non-ASCII characters</li>
              <li><strong>Unicode Escape:</strong> Convert to Unicode escape sequences</li>
              <li><strong>Hexadecimal:</strong> Convert to hex representation</li>
              <li><strong>Binary:</strong> Convert to binary (0s and 1s)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}