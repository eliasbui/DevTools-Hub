import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BarChart, FileText, Clock, Eye, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: string;
  speakingTime: string;
  readabilityScore: number;
  readabilityLevel: string;
  avgWordLength: number;
  avgSentenceLength: number;
  uniqueWords: number;
  mostCommonWords: { word: string; count: number }[];
}

export function TextStatistics() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<TextStats | null>(null);

  const calculateReadabilityScore = (avgSentenceLength: number, avgSyllablesPerWord: number): number => {
    // Flesch Reading Ease formula
    const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    return Math.max(0, Math.min(100, score));
  };

  const getReadabilityLevel = (score: number): string => {
    if (score >= 90) return 'Very Easy (5th grade)';
    if (score >= 80) return 'Easy (6th grade)';
    if (score >= 70) return 'Fairly Easy (7th grade)';
    if (score >= 60) return 'Standard (8th-9th grade)';
    if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
    if (score >= 30) return 'Difficult (College)';
    return 'Very Difficult (Graduate)';
  };

  const countSyllables = (word: string): number => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = /[aeiou]/.test(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e')) count--;
    
    // Ensure at least 1 syllable
    return Math.max(1, count);
  };

  const analyzeText = (input: string) => {
    if (!input.trim()) {
      setStats(null);
      return;
    }

    // Basic counts
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, '').length;
    const lines = input.split('\n').filter(line => line.trim()).length;
    const paragraphs = input.split(/\n\s*\n/).filter(para => para.trim()).length;
    
    // Word analysis
    const words = input.match(/\b[\w']+\b/g) || [];
    const wordCount = words.length;
    const uniqueWordsSet = new Set(words.map(w => w.toLowerCase()));
    const uniqueWords = uniqueWordsSet.size;
    
    // Sentence analysis
    const sentences = input.match(/[.!?]+/g)?.length || 1;
    const avgSentenceLength = wordCount / sentences;
    
    // Word frequency
    const wordFrequency: { [key: string]: number } = {};
    words.forEach(word => {
      const lower = word.toLowerCase();
      wordFrequency[lower] = (wordFrequency[lower] || 0) + 1;
    });
    
    // Filter out common words
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'some', 'any', 'few', 'more', 'most', 'other', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'];
    
    const significantWords = Object.entries(wordFrequency)
      .filter(([word]) => !commonWords.includes(word) && word.length > 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    // Calculate reading and speaking times
    const wordsPerMinuteReading = 200;
    const wordsPerMinuteSpeaking = 150;
    const readingMinutes = wordCount / wordsPerMinuteReading;
    const speakingMinutes = wordCount / wordsPerMinuteSpeaking;
    
    const formatTime = (minutes: number): string => {
      if (minutes < 1) return 'Less than 1 minute';
      if (minutes === 1) return '1 minute';
      if (minutes < 60) return `${Math.round(minutes)} minutes`;
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    };
    
    // Calculate readability
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
    const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
    const avgSyllablesPerWord = totalSyllables / wordCount;
    const readabilityScore = calculateReadabilityScore(avgSentenceLength, avgSyllablesPerWord);
    
    setStats({
      characters,
      charactersNoSpaces,
      words: wordCount,
      sentences,
      paragraphs,
      lines,
      readingTime: formatTime(readingMinutes),
      speakingTime: formatTime(speakingMinutes),
      readabilityScore: Math.round(readabilityScore),
      readabilityLevel: getReadabilityLevel(readabilityScore),
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      uniqueWords,
      mostCommonWords: significantWords,
    });
  };

  useEffect(() => {
    analyzeText(text);
  }, [text]);

  const sampleTexts = {
    simple: `The cat sat on the mat. It was a sunny day. Birds were singing in the trees. The cat was happy and content.`,
    medium: `In the heart of the bustling city, where skyscrapers touched the clouds and people hurried along crowded sidewalks, there existed a small, hidden garden. This oasis of tranquility, tucked away behind an old bookstore, was known only to a select few. The garden featured winding paths, blooming flowers, and a gentle fountain that whispered secrets to those who paused to listen.`,
    complex: `The epistemological implications of quantum mechanics have profoundly challenged our classical understanding of reality, necessitating a fundamental reconceptualization of the relationship between observer and observed phenomena. The Copenhagen interpretation, while mathematically consistent, introduces paradoxes that continue to perplex physicists and philosophers alike, suggesting that our macroscopic intuitions may be fundamentally inadequate for comprehending the quantum realm.`
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
              <BarChart className="w-5 h-5" />
            </motion.div>
            <span>Text Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sample Text Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Load sample:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setText(sampleTexts.simple)}
              className="animate-pulse-hover"
            >
              Simple
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setText(sampleTexts.medium)}
              className="animate-pulse-hover"
            >
              Medium
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setText(sampleTexts.complex)}
              className="animate-pulse-hover"
            >
              Complex
            </Button>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter or paste your text</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here to analyze..."
              className="min-h-[150px] md:min-h-[200px] text-xs md:text-sm smooth-transition focus:scale-[1.02]"
            />
          </div>

          {/* Statistics Display */}
          <AnimatePresence>
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Basic Counts */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-1"
                  >
                    <p className="text-sm text-muted-foreground">Characters</p>
                    <p className="text-2xl font-bold">{stats.characters.toLocaleString()}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-1"
                  >
                    <p className="text-sm text-muted-foreground">Words</p>
                    <p className="text-2xl font-bold">{stats.words.toLocaleString()}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-1"
                  >
                    <p className="text-sm text-muted-foreground">Sentences</p>
                    <p className="text-2xl font-bold">{stats.sentences}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-1"
                  >
                    <p className="text-sm text-muted-foreground">Paragraphs</p>
                    <p className="text-2xl font-bold">{stats.paragraphs}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-1"
                  >
                    <p className="text-sm text-muted-foreground">Lines</p>
                    <p className="text-2xl font-bold">{stats.lines}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-1"
                  >
                    <p className="text-sm text-muted-foreground">Unique Words</p>
                    <p className="text-2xl font-bold">{stats.uniqueWords}</p>
                  </motion.div>
                </div>

                {/* Time Estimates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center space-x-3 p-4 bg-muted rounded-lg"
                  >
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Reading Time</p>
                      <p className="font-medium">{stats.readingTime}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                    className="flex items-center space-x-3 p-4 bg-muted rounded-lg"
                  >
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Speaking Time</p>
                      <p className="font-medium">{stats.speakingTime}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Readability */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-medium">Readability Score</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{stats.readabilityLevel}</span>
                      <span className="text-sm font-medium">{stats.readabilityScore}/100</span>
                    </div>
                    <Progress value={stats.readabilityScore} className="h-2" />
                  </div>
                </motion.div>

                {/* Advanced Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Avg. Word Length</p>
                    <p className="text-lg font-medium">{stats.avgWordLength} characters</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Avg. Sentence Length</p>
                    <p className="text-lg font-medium">{stats.avgSentenceLength} words</p>
                  </div>
                </motion.div>

                {/* Most Common Words */}
                {stats.mostCommonWords.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <h3 className="text-sm font-medium">Most Frequent Words</h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.mostCommonWords.map((item, index) => (
                        <motion.div
                          key={item.word}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.65 + index * 0.05 }}
                          className="flex items-center space-x-1 px-3 py-1 bg-muted rounded-full text-sm"
                        >
                          <span>{item.word}</span>
                          <span className="text-muted-foreground">({item.count})</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}