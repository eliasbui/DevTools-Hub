import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CopyButton } from '@/components/common/CopyButton';
import { Replace, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

interface Replacement {
  id: string;
  find: string;
  replace: string;
  enabled: boolean;
}

export function TextReplacer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [replacements, setReplacements] = useState<Replacement[]>([
    { id: '1', find: '', replace: '', enabled: true }
  ]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [replacementCount, setReplacementCount] = useState(0);

  const addReplacement = () => {
    setReplacements([...replacements, {
      id: Date.now().toString(),
      find: '',
      replace: '',
      enabled: true
    }]);
  };

  const removeReplacement = (id: string) => {
    if (replacements.length > 1) {
      setReplacements(replacements.filter(r => r.id !== id));
    }
  };

  const updateReplacement = (id: string, field: 'find' | 'replace' | 'enabled', value: string | boolean) => {
    setReplacements(replacements.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const performReplacements = () => {
    if (!input.trim()) {
      setOutput('');
      setReplacementCount(0);
      return;
    }

    let result = input;
    let totalReplacements = 0;

    replacements.filter(r => r.enabled && r.find).forEach(({ find, replace }) => {
      try {
        let pattern: RegExp;
        let searchStr = find;

        if (useRegex) {
          pattern = new RegExp(searchStr, caseSensitive ? 'g' : 'gi');
        } else {
          // Escape special regex characters if not using regex
          searchStr = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          
          if (wholeWord) {
            searchStr = `\\b${searchStr}\\b`;
          }
          
          pattern = new RegExp(searchStr, caseSensitive ? 'g' : 'gi');
        }

        // Count replacements
        const matches = result.match(pattern);
        if (matches) {
          totalReplacements += matches.length;
        }

        // Perform replacement
        result = result.replace(pattern, replace);
      } catch (error) {
        // Invalid regex - skip this replacement
      }
    });

    setOutput(result);
    setReplacementCount(totalReplacements);
  };

  const loadExample = () => {
    setInput(`The quick brown fox jumps over the lazy dog.
The Fox is quick and clever.
The DOG is lazy but loyal.
Contact us at: email@example.com or phone: 123-456-7890
Visit our website at https://example.com`);
    
    setReplacements([
      { id: '1', find: 'fox', replace: 'cat', enabled: true },
      { id: '2', find: 'dog', replace: 'mouse', enabled: true },
      { id: '3', find: '\\b\\w+@\\w+\\.\\w+\\b', replace: '[EMAIL]', enabled: false },
      { id: '4', find: '\\d{3}-\\d{3}-\\d{4}', replace: '[PHONE]', enabled: false },
    ]);
    
    setUseRegex(false);
    setCaseSensitive(false);
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
              <Replace className="w-5 h-5" />
            </motion.div>
            <span>Text Replacer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="caseSensitive"
                checked={caseSensitive}
                onCheckedChange={(checked) => setCaseSensitive(!!checked)}
              />
              <label 
                htmlFor="caseSensitive" 
                className="text-sm font-medium cursor-pointer"
              >
                Case Sensitive
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="useRegex"
                checked={useRegex}
                onCheckedChange={(checked) => setUseRegex(!!checked)}
              />
              <label 
                htmlFor="useRegex" 
                className="text-sm font-medium cursor-pointer"
              >
                Use Regular Expressions
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="wholeWord"
                checked={wholeWord}
                onCheckedChange={(checked) => setWholeWord(!!checked)}
                disabled={useRegex}
              />
              <label 
                htmlFor="wholeWord" 
                className="text-sm font-medium cursor-pointer"
              >
                Whole Word Only
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadExample}
              className="animate-pulse-hover"
            >
              Load Example
            </Button>
          </div>

          {/* Replacements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Find & Replace Rules</label>
              <Button
                variant="outline"
                size="sm"
                onClick={addReplacement}
                className=""
              >
                Add Rule
              </Button>
            </div>
            
            <AnimatePresence>
              {replacements.map((replacement, index) => (
                <motion.div
                  key={replacement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                >
                  <Checkbox
                    checked={replacement.enabled}
                    onCheckedChange={(checked) => 
                      updateReplacement(replacement.id, 'enabled', !!checked)
                    }
                  />
                  <Input
                    placeholder="Find..."
                    value={replacement.find}
                    onChange={(e) => updateReplacement(replacement.id, 'find', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                  <span className="text-muted-foreground">→</span>
                  <Input
                    placeholder="Replace with..."
                    value={replacement.replace}
                    onChange={(e) => updateReplacement(replacement.id, 'replace', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReplacement(replacement.id)}
                    disabled={replacements.length === 1}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Original Text</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to perform replacements..."
                className="min-h-[300px] font-mono text-sm smooth-transition focus:scale-105"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Result</label>
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
                placeholder="Result will appear here..."
                className="min-h-[300px] font-mono text-sm bg-muted"
              />
            </div>
          </div>

          {/* Replace Button and Stats */}
          <div className="space-y-2">
            <Button 
              onClick={performReplacements} 
              className="w-full animate-pulse-hover"
              disabled={!input.trim() || !replacements.some(r => r.enabled && r.find)}
            >
              Perform Replacements
            </Button>
            
            <AnimatePresence>
              {replacementCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Made {replacementCount} replacement{replacementCount !== 1 ? 's' : ''}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Regex Help */}
          {useRegex && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h3 className="text-sm font-medium">Regular Expression Tips:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><code>\b</code> - Word boundary</li>
                <li><code>\d</code> - Any digit (0-9)</li>
                <li><code>\w</code> - Any word character (a-z, A-Z, 0-9, _)</li>
                <li><code>.</code> - Any character</li>
                <li><code>*</code> - Zero or more occurrences</li>
                <li><code>+</code> - One or more occurrences</li>
                <li><code>?</code> - Zero or one occurrence</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}