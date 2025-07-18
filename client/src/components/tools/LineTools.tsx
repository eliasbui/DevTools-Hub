import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { List, ArrowUpDown, Filter, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';

type Operation = 'sort' | 'reverse' | 'unique' | 'shuffle' | 'number' | 'trim' | 'filter';
type SortOrder = 'asc' | 'desc';
type SortType = 'alpha' | 'numeric' | 'length';

export function LineTools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [operation, setOperation] = useState<Operation>('sort');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [sortType, setSortType] = useState<SortType>('alpha');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [filterPattern, setFilterPattern] = useState('');
  const [filterInvert, setFilterInvert] = useState(false);
  const [lineStats, setLineStats] = useState({ original: 0, processed: 0 });

  const processLines = () => {
    if (!input.trim()) {
      setOutput('');
      setLineStats({ original: 0, processed: 0 });
      return;
    }

    let lines = input.split('\n');
    const originalCount = lines.length;

    // Remove empty lines if requested
    if (removeEmpty) {
      lines = lines.filter(line => line.trim() !== '');
    }

    let result: string[] = [];

    switch (operation) {
      case 'sort':
        result = sortLines(lines);
        break;
      case 'reverse':
        result = lines.reverse();
        break;
      case 'unique':
        result = getUniqueLines(lines);
        break;
      case 'shuffle':
        result = shuffleLines(lines);
        break;
      case 'number':
        result = numberLines(lines);
        break;
      case 'trim':
        result = lines.map(line => line.trim());
        break;
      case 'filter':
        result = filterLines(lines);
        break;
    }

    setOutput(result.join('\n'));
    setLineStats({ original: originalCount, processed: result.length });
  };

  const sortLines = (lines: string[]): string[] => {
    const sorted = [...lines].sort((a, b) => {
      const compareA = caseSensitive ? a : a.toLowerCase();
      const compareB = caseSensitive ? b : b.toLowerCase();

      switch (sortType) {
        case 'alpha':
          return compareA.localeCompare(compareB);
        case 'numeric':
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return numA - numB;
        case 'length':
          return a.length - b.length;
        default:
          return 0;
      }
    });

    return sortOrder === 'desc' ? sorted.reverse() : sorted;
  };

  const getUniqueLines = (lines: string[]): string[] => {
    const seen = new Set<string>();
    return lines.filter(line => {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        return true;
      }
      return false;
    });
  };

  const shuffleLines = (lines: string[]): string[] => {
    const shuffled = [...lines];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const numberLines = (lines: string[]): string[] => {
    return lines.map((line, index) => `${index + 1}. ${line}`);
  };

  const filterLines = (lines: string[]): string[] => {
    if (!filterPattern) return lines;

    try {
      const regex = new RegExp(filterPattern, caseSensitive ? 'g' : 'gi');
      return lines.filter(line => {
        const matches = regex.test(line);
        return filterInvert ? !matches : matches;
      });
    } catch {
      // Invalid regex - return original lines
      return lines;
    }
  };

  const loadExample = () => {
    setInput(`apple
Banana
cherry
apple
APPLE
123
45
789
  spaces around  
empty line below

zebra
Apple
1234`);
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
              <List className="w-5 h-5" />
            </motion.div>
            <span>Line Tools</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Operation Selection */}
          <div className="flex flex-wrap gap-4">
            <Select value={operation} onValueChange={(value: Operation) => setOperation(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sort">Sort Lines</SelectItem>
                <SelectItem value="reverse">Reverse Lines</SelectItem>
                <SelectItem value="unique">Remove Duplicates</SelectItem>
                <SelectItem value="shuffle">Shuffle Lines</SelectItem>
                <SelectItem value="number">Number Lines</SelectItem>
                <SelectItem value="trim">Trim Lines</SelectItem>
                <SelectItem value="filter">Filter Lines</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Options */}
            {operation === 'sort' && (
              <>
                <Select value={sortType} onValueChange={(value: SortType) => setSortType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alpha">Alphabetical</SelectItem>
                    <SelectItem value="numeric">Numeric</SelectItem>
                    <SelectItem value="length">By Length</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </>
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

          {/* Options */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="removeEmpty"
                checked={removeEmpty}
                onCheckedChange={(checked) => setRemoveEmpty(!!checked)}
              />
              <label 
                htmlFor="removeEmpty" 
                className="text-sm font-medium cursor-pointer"
              >
                Remove Empty Lines
              </label>
            </div>
            
            {(operation === 'sort' || operation === 'unique' || operation === 'filter') && (
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
            )}
          </div>

          {/* Filter Options */}
          {operation === 'filter' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Filter pattern (regex)..."
                  value={filterPattern}
                  onChange={(e) => setFilterPattern(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="filterInvert"
                    checked={filterInvert}
                    onCheckedChange={(checked) => setFilterInvert(!!checked)}
                  />
                  <label 
                    htmlFor="filterInvert" 
                    className="text-sm font-medium cursor-pointer whitespace-nowrap"
                  >
                    Invert Filter
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Lines</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter lines of text..."
                className="min-h-[400px] font-mono text-sm smooth-transition focus:scale-105"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Processed Lines</label>
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
                placeholder="Processed lines will appear here..."
                className="min-h-[400px] font-mono text-sm bg-muted"
              />
            </div>
          </div>

          {/* Process Button and Stats */}
          <div className="space-y-2">
            <Button 
              onClick={processLines} 
              className="w-full animate-pulse-hover"
              disabled={!input.trim()}
            >
              Process Lines
            </Button>
            
            <AnimatePresence>
              {lineStats.original > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-center gap-4 text-sm text-muted-foreground"
                >
                  <span>Original: {lineStats.original} lines</span>
                  <span>•</span>
                  <span>Processed: {lineStats.processed} lines</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Operation Icons */}
          <div className="flex justify-center gap-4 text-muted-foreground">
            <ArrowUpDown className="w-4 h-4" />
            <Filter className="w-4 h-4" />
            <Shuffle className="w-4 h-4" />
            <List className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}