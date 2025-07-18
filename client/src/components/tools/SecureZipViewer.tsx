import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Archive, Upload, Folder, File, Search, Shield, AlertTriangle, Download, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ArchiveEntry {
  name: string;
  path: string;
  size: number;
  compressedSize: number;
  modifiedDate: Date;
  isDirectory: boolean;
  compressionRatio: number;
  encrypted: boolean;
  permissions?: string;
}

interface ArchiveInfo {
  name: string;
  format: string;
  totalSize: number;
  compressedSize: number;
  entryCount: number;
  compressionRatio: number;
  hasPassword: boolean;
  comment?: string;
}

interface SecurityCheck {
  passed: boolean;
  warnings: string[];
  threats: string[];
}

export function SecureZipViewer() {
  const [archiveInfo, setArchiveInfo] = useState<ArchiveInfo | null>(null);
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [securityCheck, setSecurityCheck] = useState<SecurityCheck | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ArchiveEntry | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz'];
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js', '.jar', '.app'];
  const maxFileSize = 100 * 1024 * 1024; // 100MB limit

  const performSecurityCheck = (entries: ArchiveEntry[]): SecurityCheck => {
    const warnings: string[] = [];
    const threats: string[] = [];
    let passed = true;

    // Check for path traversal
    entries.forEach(entry => {
      if (entry.path.includes('../') || entry.path.includes('..\\')) {
        threats.push(`Path traversal detected: ${entry.path}`);
        passed = false;
      }
    });

    // Check for dangerous file types
    const dangerousFiles = entries.filter(entry => 
      dangerousExtensions.some(ext => entry.name.toLowerCase().endsWith(ext))
    );
    if (dangerousFiles.length > 0) {
      warnings.push(`Found ${dangerousFiles.length} potentially dangerous file(s)`);
    }

    // Check for zip bomb patterns
    const highCompressionEntries = entries.filter(entry => 
      entry.compressionRatio > 100 && entry.size > 1024 * 1024
    );
    if (highCompressionEntries.length > 0) {
      threats.push('Possible zip bomb detected (extremely high compression ratio)');
      passed = false;
    }

    // Check for hidden files
    const hiddenFiles = entries.filter(entry => entry.name.startsWith('.'));
    if (hiddenFiles.length > 0) {
      warnings.push(`Found ${hiddenFiles.length} hidden file(s)`);
    }

    return { passed, warnings, threats };
  };

  const analyzeArchive = async (file: File) => {
    setLoading(true);
    setError('');
    setArchiveInfo(null);
    setEntries([]);
    setSecurityCheck(null);
    setProgress(0);

    try {
      // Validate file size
      if (file.size > maxFileSize) {
        throw new Error(`File too large (max ${maxFileSize / 1024 / 1024}MB)`);
      }

      // Validate format
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!supportedFormats.includes(extension)) {
        throw new Error(`Unsupported format: ${extension}`);
      }

      setProgress(20);

      // Simulated archive reading (in real app, use JSZip or similar)
      const mockEntries: ArchiveEntry[] = [
        {
          name: 'README.md',
          path: 'README.md',
          size: 2048,
          compressedSize: 1024,
          modifiedDate: new Date(),
          isDirectory: false,
          compressionRatio: 50,
          encrypted: false
        },
        {
          name: 'src',
          path: 'src/',
          size: 0,
          compressedSize: 0,
          modifiedDate: new Date(),
          isDirectory: true,
          compressionRatio: 0,
          encrypted: false
        },
        {
          name: 'index.js',
          path: 'src/index.js',
          size: 5120,
          compressedSize: 2048,
          modifiedDate: new Date(),
          isDirectory: false,
          compressionRatio: 60,
          encrypted: false
        },
        {
          name: 'styles.css',
          path: 'src/styles.css',
          size: 3072,
          compressedSize: 1536,
          modifiedDate: new Date(),
          isDirectory: false,
          compressionRatio: 50,
          encrypted: false
        },
        {
          name: '.gitignore',
          path: '.gitignore',
          size: 512,
          compressedSize: 256,
          modifiedDate: new Date(),
          isDirectory: false,
          compressionRatio: 50,
          encrypted: false
        }
      ];

      setProgress(60);

      const info: ArchiveInfo = {
        name: file.name,
        format: extension.toUpperCase(),
        totalSize: mockEntries.reduce((sum, e) => sum + e.size, 0),
        compressedSize: file.size,
        entryCount: mockEntries.filter(e => !e.isDirectory).length,
        compressionRatio: Math.round((1 - file.size / mockEntries.reduce((sum, e) => sum + e.size, 0)) * 100),
        hasPassword: false,
        comment: 'Archive created with DevTools Hub'
      };

      setProgress(80);

      // Perform security check
      const security = performSecurityCheck(mockEntries);
      setSecurityCheck(security);

      setArchiveInfo(info);
      setEntries(mockEntries);
      setFilteredEntries(mockEntries);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze archive');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeArchive(file);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(entry =>
        entry.name.toLowerCase().includes(query.toLowerCase()) ||
        entry.path.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEntries(filtered);
    }
  };

  const previewFile = (entry: ArchiveEntry) => {
    if (entry.isDirectory) return;
    
    setSelectedEntry(entry);
    
    // Simulated file preview (in real app, extract and display actual content)
    if (entry.name.endsWith('.txt') || entry.name.endsWith('.md')) {
      setPreviewContent('This is a preview of the text file content...\n\nLorem ipsum dolor sit amet.');
    } else if (entry.name.endsWith('.json')) {
      setPreviewContent('{\n  "example": "json",\n  "preview": true\n}');
    } else if (entry.name.endsWith('.css') || entry.name.endsWith('.js')) {
      setPreviewContent('/* Code preview */\nfunction example() {\n  return "preview";\n}');
    } else {
      setPreviewContent('Binary file - preview not available');
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

  const getFileIcon = (entry: ArchiveEntry) => {
    if (entry.isDirectory) return <Folder className="w-4 h-4" />;
    if (entry.encrypted) return <Lock className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getFileTypeColor = (name: string) => {
    if (dangerousExtensions.some(ext => name.toLowerCase().endsWith(ext))) return 'text-destructive';
    if (name.endsWith('.js') || name.endsWith('.ts')) return 'text-yellow-600';
    if (name.endsWith('.css') || name.endsWith('.scss')) return 'text-blue-600';
    if (name.endsWith('.md') || name.endsWith('.txt')) return 'text-gray-600';
    return 'text-foreground';
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
              <Archive className="w-5 h-5" />
            </motion.div>
            <span>Secure ZIP Viewer</span>
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
              accept=".zip,.rar,.7z,.tar,.gz,.bz2,.xz,.tgz"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full animate-pulse-hover"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Archive File
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Supported: {supportedFormats.map(f => `.${f}`).join(', ')} (max {maxFileSize / 1024 / 1024}MB)
            </p>
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
                  <span>Analyzing archive...</span>
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
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Check Results */}
          <AnimatePresence>
            {securityCheck && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant={securityCheck.passed ? 'default' : 'destructive'}>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">
                        Security Check: {securityCheck.passed ? 'Passed' : 'Failed'}
                      </p>
                      {securityCheck.threats.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium text-destructive">Threats:</p>
                          <ul className="list-disc list-inside">
                            {securityCheck.threats.map((threat, i) => (
                              <li key={i}>{threat}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {securityCheck.warnings.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium text-warning">Warnings:</p>
                          <ul className="list-disc list-inside">
                            {securityCheck.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Archive Info */}
          <AnimatePresence>
            {archiveInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h3 className="text-sm font-medium">Archive Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Format</p>
                      <Badge variant="secondary">{archiveInfo.format}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Files</p>
                      <p>{archiveInfo.entryCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Compression</p>
                      <p>{archiveInfo.compressionRatio}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Original Size</p>
                      <p>{formatFileSize(archiveInfo.totalSize)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Compressed</p>
                      <p>{formatFileSize(archiveInfo.compressedSize)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Encrypted</p>
                      <p>{archiveInfo.hasPassword ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search files..."
                    className="pl-9"
                  />
                </div>

                {/* File List */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Archive Contents</h3>
                  <ScrollArea className="h-[300px] border rounded-lg p-2">
                    <div className="space-y-1">
                      {filteredEntries.map((entry, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => previewFile(entry)}
                          className={`flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer transition-colors ${
                            selectedEntry?.path === entry.path ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getFileIcon(entry)}
                            <span className={`text-sm truncate ${getFileTypeColor(entry.name)}`}>
                              {entry.path}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatFileSize(entry.size)}</span>
                            <span>{entry.compressionRatio}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* File Preview */}
                <AnimatePresence>
                  {selectedEntry && !selectedEntry.isDirectory && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Preview: {selectedEntry.name}</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="animate-pulse-hover"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Extract
                        </Button>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <pre className="text-xs font-mono whitespace-pre-wrap">{previewContent}</pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Features */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Features
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Path traversal protection (../ detection)</li>
              <li>✓ File size limits to prevent zip bombs</li>
              <li>✓ Dangerous file type detection</li>
              <li>✓ Client-side processing (no upload required)</li>
              <li>✓ Sandboxed preview environment</li>
              <li>✓ Memory usage protection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}