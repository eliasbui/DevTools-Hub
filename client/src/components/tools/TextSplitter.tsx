import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SplitMode = 'delimiter' | 'length' | 'words' | 'lines' | 'regex';
type OutputFormat = 'lines' | 'array' | 'json' | 'csv';

export function TextSplitter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [splitMode, setSplitMode] = useState<SplitMode>('delimiter');
  const [delimiter, setDelimiter] = useState(',');
  const [chunkSize, setChunkSize] = useState('100');
  const [regexPattern, setRegexPattern] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('lines');
  const [chunks, setChunks] = useState<string[]>([]);

  const splitText = () => {
    if (!input.trim()) {
      setOutput('');
      setChunks([]);
      return;
    }

    let result: string[] = [];

    try {
      switch (splitMode) {
        case 'delimiter':
          // Handle special delimiter characters
          let actualDelimiter = delimiter;
          if (delimiter === '\\n') actualDelimiter = '\n';
          if (delimiter === '\\t') actualDelimiter = '\t';
          if (delimiter === '\\r') actualDelimiter = '\r';
          if (delimiter === '\\s') actualDelimiter = ' ';
          
          result = input.split(actualDelimiter);
          break;

        case 'length':
          const size = parseInt(chunkSize) || 100;
          for (let i = 0; i < input.length; i += size) {
            result.push(input.substring(i, i + size));
          }
          break;

        case 'words':
          const words = input.match(/\S+/g) || [];
          const wordChunkSize = parseInt(chunkSize) || 10;
          for (let i = 0; i < words.length; i += wordChunkSize) {
            result.push(words.slice(i, i + wordChunkSize).join(' '));
          }
          break;

        case 'lines':
          const lines = input.split('\n');
          const lineChunkSize = parseInt(chunkSize) || 5;
          for (let i = 0; i < lines.length; i += lineChunkSize) {
            result.push(lines.slice(i, i + lineChunkSize).join('\n'));
          }
          break;

        case 'regex':
          if (regexPattern) {
            const regex = new RegExp(regexPattern, 'g');
            result = input.split(regex);
          } else {
            result = [input];
          }
          break;
      }

      // Clean up results
      result = result.filter(chunk => chunk.trim() !== '');
      
      setChunks(result);
      formatOutput(result);
    } catch (error) {
      setOutput('Error: Invalid input or pattern');
      setChunks([]);
    }
  };

  const formatOutput = (chunks: string[]) => {
    switch (outputFormat) {
      case 'lines':
        setOutput(chunks.join('\n'));
        break;
      case 'array':
        setOutput(chunks.map(chunk => `"${chunk.replace(/"/g, '\\"')}"`).join(', '));
        break;
      case 'json':
        setOutput(JSON.stringify(chunks, null, 2));
        break;
      case 'csv':
        // Escape CSV values
        const csvValues = chunks.map(chunk => {
          if (chunk.includes(',') || chunk.includes('"') || chunk.includes('\n')) {
            return `"${chunk.replace(/"/g, '""')}"`;
          }
          return chunk;
        });
        setOutput(csvValues.join(','));
        break;
    }
  };

  const loadExample = () => {
    switch (splitMode) {
      case 'delimiter':
        setInput('apple,banana,cherry,date,elderberry,fig,grape');
        setDelimiter(',');
        break;
      case 'length':
        setInput('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
        setChunkSize('20');
        break;
      case 'words':
        setInput('The quick brown fox jumps over the lazy dog. This is a sample sentence for word splitting demonstration.');
        setChunkSize('4');
        break;
      case 'lines':
        setInput('Line 1: Introduction\nLine 2: Background\nLine 3: Methods\nLine 4: Results\nLine 5: Discussion\nLine 6: Conclusion');
        setChunkSize('2');
        break;
      case 'regex':
        setInput('user@example.com;admin@test.org;support@company.net');
        setRegexPattern('[;,\\s]+');
        break;
    }
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
              <Scissors className="w-5 h-5" />
            </motion.div>
            <span>Text Splitter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Split Mode Selection */}
          <div className="flex flex-wrap gap-4">
            <Select value={splitMode} onValueChange={(value: SplitMode) => setSplitMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delimiter">By Delimiter</SelectItem>
                <SelectItem value="length">By Length</SelectItem>
                <SelectItem value="words">By Words</SelectItem>
                <SelectItem value="lines">By Lines</SelectItem>
                <SelectItem value="regex">By Regex</SelectItem>
              </SelectContent>
            </Select>

            {/* Mode-specific inputs */}
            {splitMode === 'delimiter' && (
              <Input
                placeholder="Delimiter (e.g., comma, \n for newline)"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-48"
              />
            )}

            {(splitMode === 'length' || splitMode === 'words' || splitMode === 'lines') && (
              <Input
                type="number"
                placeholder={splitMode === 'length' ? 'Characters per chunk' : splitMode === 'words' ? 'Words per chunk' : 'Lines per chunk'}
                value={chunkSize}
                onChange={(e) => setChunkSize(e.target.value)}
                className="w-48"
              />
            )}

            {splitMode === 'regex' && (
              <Input
                placeholder="Regular expression pattern"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="w-48 font-mono"
              />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={loadExample}
              className="animate-pulse-hover"
            >
              Load Example
            </Button>
          </div>

          {/* Output Format */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Output Format:</label>
            <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lines">Lines</SelectItem>
                <SelectItem value="array">Array</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Text</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to split..."
                className="min-h-[300px] font-mono text-sm smooth-transition focus:scale-105"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Split Result</label>
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
                placeholder="Split chunks will appear here..."
                className="min-h-[300px] font-mono text-sm bg-muted"
              />
            </div>
          </div>

          {/* Split Button */}
          <Button 
            onClick={splitText} 
            className="w-full animate-pulse-hover"
            disabled={!input.trim()}
          >
            Split Text
          </Button>

          {/* Chunks Preview */}
          <AnimatePresence>
            {chunks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <h3 className="text-sm font-medium">
                  Split into {chunks.length} chunk{chunks.length !== 1 ? 's' : ''}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {chunks.slice(0, 9).map((chunk, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-2 bg-muted rounded text-xs font-mono truncate"
                      title={chunk}
                    >
                      {chunk}
                    </motion.div>
                  ))}
                  {chunks.length > 9 && (
                    <div className="p-2 text-xs text-muted-foreground">
                      +{chunks.length - 9} more...
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="text-sm font-medium">Special Delimiters:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><code>\n</code> - Line break</li>
              <li><code>\t</code> - Tab character</li>
              <li><code>\r</code> - Carriage return</li>
              <li><code>\s</code> - Space character</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}