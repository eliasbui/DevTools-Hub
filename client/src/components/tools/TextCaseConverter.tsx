import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { Type, RefreshCw } from 'lucide-react';

export function TextCaseConverter() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});

  const convertCases = () => {
    if (!input.trim()) return;

    const conversions = {
      'UPPERCASE': input.toUpperCase(),
      'lowercase': input.toLowerCase(),
      'Title Case': input.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      ),
      'Sentence case': input.charAt(0).toUpperCase() + input.slice(1).toLowerCase(),
      'camelCase': input
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()),
      'PascalCase': input
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
        .replace(/^(.)/, (m, chr) => chr.toUpperCase()),
      'snake_case': input
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
      'kebab-case': input
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
      'CONSTANT_CASE': input
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
      'dot.case': input
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, ''),
      'sPoNgEbOb CaSe': input
        .split('')
        .map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
        .join(''),
      'INVERTED cASE': input
        .split('')
        .map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())
        .join(''),
    };

    setResults(conversions);
  };

  const clearAll = () => {
    setInput('');
    setResults({});
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.trim()) {
      convertCases();
    } else {
      setResults({});
    }
  };

  const caseDescriptions = {
    'UPPERCASE': 'All letters in uppercase',
    'lowercase': 'All letters in lowercase',
    'Title Case': 'First letter of each word capitalized',
    'Sentence case': 'Only first letter capitalized',
    'camelCase': 'First word lowercase, subsequent words capitalized',
    'PascalCase': 'First letter of each word capitalized, no spaces',
    'snake_case': 'Words separated by underscores, all lowercase',
    'kebab-case': 'Words separated by hyphens, all lowercase',
    'CONSTANT_CASE': 'All uppercase with underscores',
    'dot.case': 'Words separated by dots, all lowercase',
    'sPoNgEbOb CaSe': 'Alternating case for each character',
    'INVERTED cASE': 'Inverts the case of each character',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-primary" />
          <span>Text Case Converter</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Input Text</label>
              <Button onClick={clearAll} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter text to convert..."
              className="min-h-[100px]"
            />
          </div>

          {/* Results */}
          {Object.keys(results).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Converted Text</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(results).map(([caseName, convertedText]) => (
                  <div key={caseName} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{caseName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {caseDescriptions[caseName as keyof typeof caseDescriptions]}
                        </p>
                      </div>
                      <CopyButton text={convertedText} size="sm" />
                    </div>
                    <div className="p-2 bg-muted/50 rounded font-mono text-sm break-all">
                      {convertedText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Common Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Programming</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• camelCase for JavaScript variables</li>
                  <li>• PascalCase for class names</li>
                  <li>• snake_case for Python variables</li>
                  <li>• kebab-case for CSS classes</li>
                </ul>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Documentation</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Title Case for headings</li>
                  <li>• Sentence case for descriptions</li>
                  <li>• CONSTANT_CASE for environment variables</li>
                  <li>• dot.case for file extensions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}