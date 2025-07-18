import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCode, Copy, Download, Minimize2, Maximize2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/common/CopyButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CodeStats {
  originalSize: number;
  minifiedSize: number;
  savings: number;
  savingsPercent: number;
}

export function CodeMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [mode, setMode] = useState<'minify' | 'beautify'>('minify');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<CodeStats | null>(null);

  // Simple minification functions
  const minifyJavaScript = (code: string): string => {
    try {
      // Remove comments
      let minified = code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\/\/.*$/gm, ''); // Remove single-line comments
      
      // Remove unnecessary whitespace
      minified = minified
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*([{}();,:])\s*/g, '$1') // Remove spaces around operators
        .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
        .trim();
      
      return minified;
    } catch {
      throw new Error('Failed to minify JavaScript');
    }
  };

  const beautifyJavaScript = (code: string): string => {
    try {
      let beautified = code;
      let indentLevel = 0;
      const indent = '  ';
      
      // Add line breaks and indentation
      beautified = beautified.replace(/([{};])/g, (match, p1) => {
        if (p1 === '{') {
          const result = ' {\n' + indent.repeat(++indentLevel);
          return result;
        } else if (p1 === '}') {
          indentLevel = Math.max(0, indentLevel - 1);
          return '\n' + indent.repeat(indentLevel) + '}\n' + indent.repeat(indentLevel);
        } else if (p1 === ';') {
          return ';\n' + indent.repeat(indentLevel);
        }
        return match;
      });
      
      // Clean up extra line breaks
      beautified = beautified
        .replace(/\n\s*\n/g, '\n')
        .replace(/{\s*}/g, '{}')
        .trim();
      
      return beautified;
    } catch {
      throw new Error('Failed to beautify JavaScript');
    }
  };

  const minifyCSS = (code: string): string => {
    try {
      let minified = code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around CSS operators
        .replace(/;}/g, '}') // Remove last semicolon in blocks
        .replace(/\s*!important/g, '!important')
        .trim();
      
      return minified;
    } catch {
      throw new Error('Failed to minify CSS');
    }
  };

  const beautifyCSS = (code: string): string => {
    try {
      let beautified = code;
      
      // Add line breaks and indentation
      beautified = beautified
        .replace(/}/g, '}\n\n') // Line break after closing brace
        .replace(/{/g, ' {\n  ') // Line break and indent after opening brace
        .replace(/;/g, ';\n  ') // Line break and indent after semicolon
        .replace(/,\s*/g, ',\n') // Line break after comma in selectors
        .replace(/\n\s*}/g, '\n}') // Remove indent before closing brace
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();
      
      return beautified;
    } catch {
      throw new Error('Failed to beautify CSS');
    }
  };

  const minifyHTML = (code: string): string => {
    try {
      let minified = code
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces
        .replace(/>\s+</g, '><') // Remove spaces between tags
        .replace(/\s*=\s*/g, '=') // Remove spaces around equals
        .trim();
      
      return minified;
    } catch {
      throw new Error('Failed to minify HTML');
    }
  };

  const beautifyHTML = (code: string): string => {
    try {
      let beautified = code;
      let indentLevel = 0;
      const indent = '  ';
      const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
      
      // Process each tag
      beautified = beautified.replace(/<[^>]+>/g, (match) => {
        const isClosingTag = match.startsWith('</');
        const tagName = match.match(/<\/?([^\s>]+)/)?.[1]?.toLowerCase();
        const isSelfClosing = selfClosingTags.includes(tagName || '') || match.endsWith('/>');
        
        if (isClosingTag) {
          indentLevel = Math.max(0, indentLevel - 1);
          return '\n' + indent.repeat(indentLevel) + match;
        } else {
          const result = '\n' + indent.repeat(indentLevel) + match;
          if (!isSelfClosing) {
            indentLevel++;
          }
          return result;
        }
      });
      
      // Clean up
      beautified = beautified
        .replace(/^\n/, '') // Remove first line break
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();
      
      return beautified;
    } catch {
      throw new Error('Failed to beautify HTML');
    }
  };

  const minifyJSON = (code: string): string => {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed);
    } catch {
      throw new Error('Invalid JSON');
    }
  };

  const beautifyJSON = (code: string): string => {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch {
      throw new Error('Invalid JSON');
    }
  };

  const processCode = () => {
    setError('');
    setOutput('');
    setStats(null);
    
    if (!input.trim()) {
      setError('Please enter some code to process');
      return;
    }
    
    try {
      let result = '';
      
      if (mode === 'minify') {
        switch (language) {
          case 'javascript':
            result = minifyJavaScript(input);
            break;
          case 'css':
            result = minifyCSS(input);
            break;
          case 'html':
            result = minifyHTML(input);
            break;
          case 'json':
            result = minifyJSON(input);
            break;
          default:
            throw new Error('Unsupported language');
        }
      } else {
        switch (language) {
          case 'javascript':
            result = beautifyJavaScript(input);
            break;
          case 'css':
            result = beautifyCSS(input);
            break;
          case 'html':
            result = beautifyHTML(input);
            break;
          case 'json':
            result = beautifyJSON(input);
            break;
          default:
            throw new Error('Unsupported language');
        }
      }
      
      setOutput(result);
      
      // Calculate stats
      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([result]).size;
      const savings = originalSize - minifiedSize;
      const savingsPercent = Math.round((savings / originalSize) * 100);
      
      setStats({
        originalSize,
        minifiedSize,
        savings,
        savingsPercent
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process code');
    }
  };

  const downloadOutput = () => {
    if (!output) return;
    
    const extension = {
      javascript: '.js',
      css: '.css',
      html: '.html',
      json: '.json'
    }[language] || '.txt';
    
    const filename = `${mode === 'minify' ? 'minified' : 'beautified'}${extension}`;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(2) + ' KB';
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
              <FileCode className="w-5 h-5" />
            </motion.div>
            <span>Code Minifier & Beautifier</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>

            <Tabs value={mode} onValueChange={(v) => setMode(v as 'minify' | 'beautify')} className="flex-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="minify" className="flex items-center gap-2">
                  <Minimize2 className="w-4 h-4" />
                  Minify
                </TabsTrigger>
                <TabsTrigger value="beautify" className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  Beautify
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Input Code</label>
              {input && (
                <Badge variant="secondary">{formatBytes(new Blob([input]).size)}</Badge>
              )}
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste your ${language.toUpperCase()} code here...`}
              className="font-mono text-sm h-[200px]"
            />
          </div>

          {/* Process Button */}
          <Button
            onClick={processCode}
            className="w-full animate-pulse-hover"
            disabled={!input.trim()}
          >
            <Zap className="w-4 h-4 mr-2" />
            {mode === 'minify' ? 'Minify Code' : 'Beautify Code'}
          </Button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <AnimatePresence>
            {stats && mode === 'minify' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-muted rounded-lg"
              >
                <h4 className="text-sm font-medium mb-2">Compression Results</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Original</p>
                    <p className="font-mono">{formatBytes(stats.originalSize)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Minified</p>
                    <p className="font-mono">{formatBytes(stats.minifiedSize)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Saved</p>
                    <p className="font-mono text-green-600 dark:text-green-400">
                      {formatBytes(stats.savings)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reduction</p>
                    <p className="font-mono text-green-600 dark:text-green-400">
                      {stats.savingsPercent}%
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Output */}
          <AnimatePresence>
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {mode === 'minify' ? 'Minified' : 'Beautified'} Code
                  </label>
                  <div className="flex items-center gap-2">
                    {output && (
                      <Badge variant="secondary">{formatBytes(new Blob([output]).size)}</Badge>
                    )}
                    <CopyButton value={output} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadOutput}
                      className="animate-pulse-hover"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={output}
                  readOnly
                  className="font-mono text-sm h-[200px]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="text-sm font-medium">Features</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Minify JavaScript, CSS, HTML, and JSON files</li>
              <li>• Beautify and format code with proper indentation</li>
              <li>• Remove comments and unnecessary whitespace</li>
              <li>• Real-time compression statistics</li>
              <li>• Support for large files with instant processing</li>
              <li>• Download processed code with appropriate extensions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}