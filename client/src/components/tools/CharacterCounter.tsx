import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface CharacterBreakdown {
  letters: number;
  digits: number;
  spaces: number;
  punctuation: number;
  symbols: number;
  unicode: number;
  controlChars: number;
}

interface DetailedStats {
  totalCharacters: number;
  charactersNoSpaces: number;
  charactersNoWhitespace: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  bytes: number;
  breakdown: CharacterBreakdown;
  uniqueCharacters: number;
  mostFrequent: { char: string; count: number; percentage: number }[];
}

export function CharacterCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const analyzeCharacters = (input: string) => {
    if (!input) {
      setStats(null);
      return;
    }

    // Basic counts
    const totalCharacters = input.length;
    const charactersNoSpaces = input.replace(/ /g, '').length;
    const charactersNoWhitespace = input.replace(/\s/g, '').length;
    
    // Word count
    const words = input.match(/\b[\w']+\b/g)?.length || 0;
    
    // Sentence count (approximate)
    const sentences = input.match(/[.!?]+/g)?.length || 0;
    
    // Paragraph count
    const paragraphs = input.split(/\n\s*\n/).filter(p => p.trim()).length;
    
    // Line count
    const lines = input.split('\n').length;
    
    // Byte size
    const bytes = new Blob([input]).size;
    
    // Character breakdown
    const breakdown: CharacterBreakdown = {
      letters: (input.match(/[a-zA-Z]/g) || []).length,
      digits: (input.match(/[0-9]/g) || []).length,
      spaces: (input.match(/ /g) || []).length,
      punctuation: (input.match(/[.,;:!?"'`\-_()[\]{}]/g) || []).length,
      symbols: (input.match(/[@#$%^&*+=|\\/<>~]/g) || []).length,
      unicode: (input.match(/[^\x00-\x7F]/g) || []).length,
      controlChars: (input.match(/[\x00-\x1F\x7F]/g) || []).length,
    };
    
    // Character frequency analysis
    const charFrequency: { [key: string]: number } = {};
    for (const char of input) {
      if (char.trim()) { // Skip whitespace in frequency analysis
        charFrequency[char] = (charFrequency[char] || 0) + 1;
      }
    }
    
    // Get unique character count
    const uniqueCharacters = Object.keys(charFrequency).length;
    
    // Get most frequent characters
    const mostFrequent = Object.entries(charFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([char, count]) => ({
        char,
        count,
        percentage: Math.round((count / totalCharacters) * 100 * 10) / 10
      }));
    
    setStats({
      totalCharacters,
      charactersNoSpaces,
      charactersNoWhitespace,
      words,
      sentences,
      paragraphs,
      lines,
      bytes,
      breakdown,
      uniqueCharacters,
      mostFrequent
    });
  };

  useEffect(() => {
    analyzeCharacters(text);
  }, [text]);

  const sampleText = `Hello World! 123
This is a sample text with various characters.
It includes letters, numbers (456), and symbols: @#$%
Some Unicode too: 你好 😊 €

Special characters: []{}()<>`;

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
              <Calculator className="w-5 h-5" />
            </motion.div>
            <span>Character Counter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sample Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setText(sampleText)}
            className="animate-pulse-hover"
          >
            Load Sample
          </Button>

          {/* Text Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter your text</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="min-h-[200px] smooth-transition focus:scale-105"
            />
          </div>

          {/* Statistics */}
          <AnimatePresence>
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Primary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-primary/10 rounded-lg text-center"
                  >
                    <p className="text-3xl font-bold text-primary">{stats.totalCharacters.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Characters</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="p-4 bg-muted rounded-lg text-center"
                  >
                    <p className="text-2xl font-bold">{stats.charactersNoSpaces.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Without Spaces</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-muted rounded-lg text-center"
                  >
                    <p className="text-2xl font-bold">{stats.words}</p>
                    <p className="text-sm text-muted-foreground">Words</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="p-4 bg-muted rounded-lg text-center"
                  >
                    <p className="text-2xl font-bold">{stats.bytes}</p>
                    <p className="text-sm text-muted-foreground">Bytes</p>
                  </motion.div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-medium">{stats.sentences}</p>
                    <p className="text-sm text-muted-foreground">Sentences</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium">{stats.paragraphs}</p>
                    <p className="text-sm text-muted-foreground">Paragraphs</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium">{stats.lines}</p>
                    <p className="text-sm text-muted-foreground">Lines</p>
                  </div>
                </div>

                {/* Character Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Character Breakdown</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBreakdown(!showBreakdown)}
                    >
                      {showBreakdown ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {showBreakdown && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        {Object.entries(stats.breakdown).map(([type, count]) => {
                          if (count === 0) return null;
                          const percentage = (count / stats.totalCharacters) * 100;
                          return (
                            <div key={type} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span>{count} ({percentage.toFixed(1)}%)</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Most Frequent Characters */}
                {stats.mostFrequent.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                  >
                    <h3 className="text-sm font-medium">Most Frequent Characters</h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.mostFrequent.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.45 + index * 0.05 }}
                          className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-full text-sm"
                        >
                          <span className="font-mono font-bold">
                            {item.char === ' ' ? '␣' : item.char}
                          </span>
                          <span className="text-muted-foreground">
                            {item.count} ({item.percentage}%)
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Unique Characters */}
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-lg font-medium">{stats.uniqueCharacters}</p>
                  <p className="text-sm text-muted-foreground">Unique Characters</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}