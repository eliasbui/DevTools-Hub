import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, BarChart3, Binary, Type, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileStats {
  name: string;
  size: {
    bytes: number;
    formatted: string;
    breakdown: {
      kb: number;
      mb: number;
      gb: number;
    };
  };
  encoding: string;
  isBinary: boolean;
  lineStats: {
    total: number;
    empty: number;
    nonEmpty: number;
    maxLength: number;
    avgLength: number;
  };
  charStats: {
    total: number;
    whitespace: number;
    alphanumeric: number;
    special: number;
    unicode: number;
  };
  wordStats: {
    total: number;
    unique: number;
    avgLength: number;
    longest: string;
  };
  entropy: number;
  mimeType: string;
  lastModified: Date;
}

export function FileSumCalculator() {
  const [fileStats, setFileStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectEncoding = (buffer: ArrayBuffer): string => {
    const arr = new Uint8Array(buffer);
    
    // Check for BOM
    if (arr[0] === 0xEF && arr[1] === 0xBB && arr[2] === 0xBF) return 'UTF-8 with BOM';
    if (arr[0] === 0xFF && arr[1] === 0xFE) return 'UTF-16 LE';
    if (arr[0] === 0xFE && arr[1] === 0xFF) return 'UTF-16 BE';
    
    // Simple heuristic for UTF-8
    let utf8Valid = true;
    for (let i = 0; i < Math.min(arr.length, 1000); i++) {
      if (arr[i] > 127) {
        // Check if it follows UTF-8 pattern
        if ((arr[i] & 0xE0) === 0xC0) i++; // 2-byte char
        else if ((arr[i] & 0xF0) === 0xE0) i += 2; // 3-byte char
        else if ((arr[i] & 0xF8) === 0xF0) i += 3; // 4-byte char
        else utf8Valid = false;
      }
    }
    
    return utf8Valid ? 'UTF-8' : 'ASCII/Binary';
  };

  const isBinaryFile = (buffer: ArrayBuffer): boolean => {
    const arr = new Uint8Array(buffer);
    const sampleSize = Math.min(arr.length, 8192);
    let nullBytes = 0;
    let controlChars = 0;
    
    for (let i = 0; i < sampleSize; i++) {
      if (arr[i] === 0) nullBytes++;
      if (arr[i] < 32 && arr[i] !== 9 && arr[i] !== 10 && arr[i] !== 13) controlChars++;
    }
    
    // If more than 30% null bytes or control characters, likely binary
    return (nullBytes / sampleSize > 0.3) || (controlChars / sampleSize > 0.3);
  };

  const calculateEntropy = (text: string): number => {
    const frequencies: Record<string, number> = {};
    for (const char of text) {
      frequencies[char] = (frequencies[char] || 0) + 1;
    }
    
    let entropy = 0;
    const length = text.length;
    for (const char in frequencies) {
      const frequency = frequencies[char] / length;
      entropy -= frequency * Math.log2(frequency);
    }
    
    return entropy;
  };

  const analyzeFile = async (file: File) => {
    setLoading(true);
    setError('');
    setFileStats(null);
    setProgress(0);

    try {
      const buffer = await file.arrayBuffer();
      setProgress(25);
      
      const encoding = detectEncoding(buffer);
      const binary = isBinaryFile(buffer);
      setProgress(50);
      
      let stats: FileStats = {
        name: file.name,
        size: {
          bytes: file.size,
          formatted: formatFileSize(file.size),
          breakdown: {
            kb: file.size / 1024,
            mb: file.size / (1024 * 1024),
            gb: file.size / (1024 * 1024 * 1024)
          }
        },
        encoding,
        isBinary: binary,
        mimeType: file.type || 'Unknown',
        lastModified: new Date(file.lastModified),
        lineStats: {
          total: 0,
          empty: 0,
          nonEmpty: 0,
          maxLength: 0,
          avgLength: 0
        },
        charStats: {
          total: 0,
          whitespace: 0,
          alphanumeric: 0,
          special: 0,
          unicode: 0
        },
        wordStats: {
          total: 0,
          unique: 0,
          avgLength: 0,
          longest: ''
        },
        entropy: 0
      };
      
      if (!binary) {
        // Analyze text content
        const text = new TextDecoder(encoding.split(' ')[0]).decode(buffer);
        const lines = text.split(/\r?\n/);
        
        // Line statistics
        stats.lineStats.total = lines.length;
        let totalLineLength = 0;
        
        for (const line of lines) {
          if (line.trim() === '') {
            stats.lineStats.empty++;
          } else {
            stats.lineStats.nonEmpty++;
          }
          stats.lineStats.maxLength = Math.max(stats.lineStats.maxLength, line.length);
          totalLineLength += line.length;
        }
        
        stats.lineStats.avgLength = totalLineLength / lines.length;
        setProgress(70);
        
        // Character statistics
        stats.charStats.total = text.length;
        for (const char of text) {
          if (/\s/.test(char)) stats.charStats.whitespace++;
          else if (/[a-zA-Z0-9]/.test(char)) stats.charStats.alphanumeric++;
          else if (char.charCodeAt(0) > 127) stats.charStats.unicode++;
          else stats.charStats.special++;
        }
        
        // Word statistics
        const words = text.match(/\b[\w']+\b/g) || [];
        const wordSet = new Set(words.map(w => w.toLowerCase()));
        stats.wordStats.total = words.length;
        stats.wordStats.unique = wordSet.size;
        
        if (words.length > 0) {
          const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
          stats.wordStats.avgLength = totalWordLength / words.length;
          stats.wordStats.longest = words.reduce((longest, word) => 
            word.length > longest.length ? word : longest, '');
        }
        
        // Calculate entropy
        stats.entropy = calculateEntropy(text.substring(0, 10000)); // Sample first 10KB
        setProgress(90);
      }
      
      setFileStats(stats);
      setProgress(100);
    } catch (err) {
      setError('Failed to analyze file. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeFile(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const downloadReport = () => {
    if (!fileStats) return;
    
    const report = `File Analysis Report
===================
File: ${fileStats.name}
Date: ${new Date().toISOString()}

Size Information:
- Bytes: ${fileStats.size.bytes}
- Formatted: ${fileStats.size.formatted}
- KB: ${fileStats.size.breakdown.kb.toFixed(2)}
- MB: ${fileStats.size.breakdown.mb.toFixed(2)}
- GB: ${fileStats.size.breakdown.gb.toFixed(6)}

File Properties:
- Encoding: ${fileStats.encoding}
- Type: ${fileStats.isBinary ? 'Binary' : 'Text'}
- MIME Type: ${fileStats.mimeType}
- Last Modified: ${fileStats.lastModified.toLocaleString()}

${!fileStats.isBinary ? `
Line Statistics:
- Total Lines: ${fileStats.lineStats.total}
- Non-Empty Lines: ${fileStats.lineStats.nonEmpty}
- Empty Lines: ${fileStats.lineStats.empty}
- Max Line Length: ${fileStats.lineStats.maxLength}
- Average Line Length: ${fileStats.lineStats.avgLength.toFixed(2)}

Character Statistics:
- Total Characters: ${fileStats.charStats.total}
- Alphanumeric: ${fileStats.charStats.alphanumeric}
- Whitespace: ${fileStats.charStats.whitespace}
- Special Characters: ${fileStats.charStats.special}
- Unicode Characters: ${fileStats.charStats.unicode}

Word Statistics:
- Total Words: ${fileStats.wordStats.total}
- Unique Words: ${fileStats.wordStats.unique}
- Average Word Length: ${fileStats.wordStats.avgLength.toFixed(2)}
- Longest Word: ${fileStats.wordStats.longest}

Entropy: ${fileStats.entropy.toFixed(4)} bits/character` : ''}

Generated by DevTools Hub`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileStats.name}.analysis.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <BarChart3 className="w-5 h-5" />
            </motion.div>
            <span>File Sum Calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full animate-pulse-hover"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select File for Analysis
            </Button>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span>Analyzing file...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </motion.div>
            )}
          </AnimatePresence>

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

          {/* Results */}
          <AnimatePresence>
            {fileStats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                {/* File Overview */}
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      {fileStats.isBinary ? <Binary className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      File Overview
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadReport}
                      className="animate-pulse-hover"
                    >
                      Download Report
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-mono truncate">{fileStats.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p>{fileStats.size.formatted}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Encoding</p>
                      <p>{fileStats.encoding}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="flex items-center gap-1">
                        {fileStats.isBinary ? (
                          <>Binary File</>
                        ) : (
                          <>Text File</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Size Breakdown */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h3 className="text-sm font-medium">Size Analysis</h3>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{fileStats.size.breakdown.kb.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Kilobytes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{fileStats.size.breakdown.mb.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Megabytes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{fileStats.size.breakdown.gb.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">Gigabytes</p>
                    </div>
                  </div>
                </div>

                {/* Text File Statistics */}
                {!fileStats.isBinary && (
                  <>
                    {/* Line Statistics */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Line Statistics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Lines</p>
                          <p className="font-mono">{fileStats.lineStats.total.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Non-Empty</p>
                          <p className="font-mono">{fileStats.lineStats.nonEmpty.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Max Length</p>
                          <p className="font-mono">{fileStats.lineStats.maxLength}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Length</p>
                          <p className="font-mono">{fileStats.lineStats.avgLength.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Character Statistics */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h3 className="text-sm font-medium">Character Breakdown</h3>
                      <div className="space-y-2">
                        {[
                          { label: 'Total Characters', value: fileStats.charStats.total, percent: 100 },
                          { label: 'Alphanumeric', value: fileStats.charStats.alphanumeric, percent: (fileStats.charStats.alphanumeric / fileStats.charStats.total) * 100 },
                          { label: 'Whitespace', value: fileStats.charStats.whitespace, percent: (fileStats.charStats.whitespace / fileStats.charStats.total) * 100 },
                          { label: 'Special', value: fileStats.charStats.special, percent: (fileStats.charStats.special / fileStats.charStats.total) * 100 },
                          { label: 'Unicode', value: fileStats.charStats.unicode, percent: (fileStats.charStats.unicode / fileStats.charStats.total) * 100 }
                        ].map((stat, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{stat.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{stat.value.toLocaleString()}</span>
                              {index > 0 && (
                                <span className="text-xs text-muted-foreground">({stat.percent.toFixed(1)}%)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Word Statistics */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h3 className="text-sm font-medium">Word Analysis</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Words</p>
                          <p className="font-mono">{fileStats.wordStats.total.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Unique Words</p>
                          <p className="font-mono">{fileStats.wordStats.unique.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Word Length</p>
                          <p className="font-mono">{fileStats.wordStats.avgLength.toFixed(1)} chars</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Longest Word</p>
                          <p className="font-mono truncate">{fileStats.wordStats.longest}</p>
                        </div>
                      </div>
                    </div>

                    {/* Entropy */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Information Entropy
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Shannon Entropy</span>
                        <span className="font-mono">{fileStats.entropy.toFixed(4)} bits/char</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fileStats.entropy < 3 ? 'Low entropy (repetitive content)' :
                         fileStats.entropy < 5 ? 'Medium entropy (structured text)' :
                         'High entropy (compressed/encrypted)'}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="text-sm font-medium">Analysis Features</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Precise file size calculations in multiple units</li>
              <li>• Automatic encoding detection (UTF-8, UTF-16, ASCII)</li>
              <li>• Binary vs text file classification</li>
              <li>• Comprehensive line and word statistics</li>
              <li>• Character distribution analysis</li>
              <li>• Information entropy calculation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}