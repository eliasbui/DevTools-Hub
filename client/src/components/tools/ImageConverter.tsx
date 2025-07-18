import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Download, Image, FileImage, Settings, Loader2, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  outputBlob?: Blob;
  outputUrl?: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

interface ConversionSettings {
  format: string;
  quality: number;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  backgroundColor?: string;
}

const formatInfo = {
  jpeg: { mime: 'image/jpeg', extension: '.jpg', supportsTransparency: false, supportsAnimation: false },
  png: { mime: 'image/png', extension: '.png', supportsTransparency: true, supportsAnimation: false },
  webp: { mime: 'image/webp', extension: '.webp', supportsTransparency: true, supportsAnimation: true },
  avif: { mime: 'image/avif', extension: '.avif', supportsTransparency: true, supportsAnimation: true },
  gif: { mime: 'image/gif', extension: '.gif', supportsTransparency: true, supportsAnimation: true },
  bmp: { mime: 'image/bmp', extension: '.bmp', supportsTransparency: false, supportsAnimation: false },
  tiff: { mime: 'image/tiff', extension: '.tiff', supportsTransparency: true, supportsAnimation: false },
  ico: { mime: 'image/x-icon', extension: '.ico', supportsTransparency: true, supportsAnimation: false },
  pdf: { mime: 'application/pdf', extension: '.pdf', supportsTransparency: true, supportsAnimation: false }
};

export function ImageConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    format: 'webp',
    quality: 85,
    maintainAspectRatio: true,
    backgroundColor: '#FFFFFF'
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFiles = async (files: File[]) => {
    const newImages: ImageFile[] = [];
    
    for (const file of files) {
      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      
      // Get image dimensions
      const img = new Image();
      img.src = preview;
      await new Promise(resolve => img.onload = resolve);
      
      newImages.push({
        id,
        file,
        preview,
        status: 'pending',
        metadata: {
          width: img.width,
          height: img.height,
          size: file.size,
          format: file.type.split('/')[1] || 'unknown'
        }
      });
    }
    
    setImages(prev => [...prev, ...newImages]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const convertImage = async (imageFile: ImageFile): Promise<void> => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    try {
      // Update status
      setImages(prev => prev.map(img => 
        img.id === imageFile.id ? { ...img, status: 'processing' } : img
      ));
      
      // Load image
      const img = new Image();
      img.src = imageFile.preview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Calculate dimensions
      let targetWidth = settings.width || img.width;
      let targetHeight = settings.height || img.height;
      
      if (settings.maintainAspectRatio && (settings.width || settings.height)) {
        const aspectRatio = img.width / img.height;
        if (settings.width && !settings.height) {
          targetHeight = targetWidth / aspectRatio;
        } else if (settings.height && !settings.width) {
          targetWidth = targetHeight * aspectRatio;
        } else {
          // Both dimensions specified, fit within bounds
          const scaleX = targetWidth / img.width;
          const scaleY = targetHeight / img.height;
          const scale = Math.min(scaleX, scaleY);
          targetWidth = img.width * scale;
          targetHeight = img.height * scale;
        }
      }
      
      // Set canvas size
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Handle transparency for formats that don't support it
      if (!formatInfo[settings.format as keyof typeof formatInfo]?.supportsTransparency) {
        ctx.fillStyle = settings.backgroundColor || '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }
      
      // Draw image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to convert image'));
          },
          formatInfo[settings.format as keyof typeof formatInfo]?.mime || 'image/jpeg',
          settings.quality / 100
        );
      });
      
      const outputUrl = URL.createObjectURL(blob);
      
      // Update image with result
      setImages(prev => prev.map(img => 
        img.id === imageFile.id 
          ? { ...img, status: 'completed', outputBlob: blob, outputUrl }
          : img
      ));
    } catch (error) {
      setImages(prev => prev.map(img => 
        img.id === imageFile.id 
          ? { ...img, status: 'error', error: 'Failed to convert image' }
          : img
      ));
    }
  };

  const convertAll = async () => {
    setLoading(true);
    setProgress(0);
    
    const pendingImages = images.filter(img => img.status === 'pending');
    const total = pendingImages.length;
    
    for (let i = 0; i < pendingImages.length; i++) {
      await convertImage(pendingImages[i]);
      setProgress(((i + 1) / total) * 100);
    }
    
    setLoading(false);
    setTimeout(() => setProgress(0), 500);
  };

  const downloadImage = (image: ImageFile) => {
    if (!image.outputUrl || !image.outputBlob) return;
    
    const a = document.createElement('a');
    a.href = image.outputUrl;
    const extension = formatInfo[settings.format as keyof typeof formatInfo]?.extension || '.jpg';
    a.download = image.file.name.replace(/\.[^/.]+$/, '') + extension;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    const completedImages = images.filter(img => img.status === 'completed');
    completedImages.forEach(img => downloadImage(img));
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        if (image.outputUrl) URL.revokeObjectURL(image.outputUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach(image => {
      URL.revokeObjectURL(image.preview);
      if (image.outputUrl) URL.revokeObjectURL(image.outputUrl);
    });
    setImages([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <FileImage className="w-5 h-5" />
              </motion.div>
              <span>Image Converter</span>
            </div>
            {images.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-destructive"
              >
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Canvas for conversion (hidden) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              multiple
              accept="image/*"
              className="hidden"
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            </motion.div>
            <p className="text-sm text-muted-foreground mb-2">
              Drag & drop images here, or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="animate-pulse-hover"
            >
              Select Images
            </Button>
          </div>

          {/* Settings */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select
                  value={settings.format}
                  onValueChange={(value) => setSettings({ ...settings, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG (Smallest file size)</SelectItem>
                    <SelectItem value="png">PNG (Lossless)</SelectItem>
                    <SelectItem value="webp">WebP (30% smaller)</SelectItem>
                    <SelectItem value="avif">AVIF (50% smaller)</SelectItem>
                    <SelectItem value="gif">GIF (Animation)</SelectItem>
                    <SelectItem value="bmp">BMP (Uncompressed)</SelectItem>
                    <SelectItem value="tiff">TIFF (High quality)</SelectItem>
                    <SelectItem value="ico">ICO (Icon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quality ({settings.quality}%)</Label>
                <Slider
                  value={[settings.quality]}
                  onValueChange={([value]) => setSettings({ ...settings, quality: value })}
                  min={1}
                  max={100}
                  step={1}
                  disabled={settings.format === 'png' || settings.format === 'bmp'}
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:text-primary">
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                Advanced Settings
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Width (pixels)</Label>
                    <Input
                      type="number"
                      placeholder="Auto"
                      value={settings.width || ''}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        width: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (pixels)</Label>
                    <Input
                      type="number"
                      placeholder="Auto"
                      value={settings.height || ''}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        height: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                  </div>
                </div>

                {!formatInfo[settings.format as keyof typeof formatInfo]?.supportsTransparency && (
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
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
                  <span>Converting images...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Convert Button */}
          {images.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={convertAll}
                disabled={loading || images.every(img => img.status !== 'pending')}
                className="flex-1 animate-pulse-hover"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Convert All
                  </>
                )}
              </Button>
              {images.some(img => img.status === 'completed') && (
                <Button
                  onClick={downloadAll}
                  variant="outline"
                  className="animate-pulse-hover"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          )}

          {/* Image List */}
          <AnimatePresence>
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <div className="space-y-3">
                    {images.map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                      >
                        <img
                          src={image.preview}
                          alt={image.file.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{image.file.name}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{image.metadata.width} × {image.metadata.height}</span>
                            <span>{formatFileSize(image.metadata.size)}</span>
                            {image.status === 'completed' && image.outputBlob && (
                              <>
                                <span>→</span>
                                <span className="text-primary">
                                  {formatFileSize(image.outputBlob.size)} 
                                  ({Math.round((1 - image.outputBlob.size / image.metadata.size) * 100)}% smaller)
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {image.status === 'pending' && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {image.status === 'processing' && (
                            <Badge variant="default">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Processing
                            </Badge>
                          )}
                          {image.status === 'completed' && (
                            <>
                              <Badge variant="default" className="bg-green-600">Complete</Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => downloadImage(image)}
                                className="animate-pulse-hover"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {image.status === 'error' && (
                            <Badge variant="destructive">Error</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeImage(image.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="text-sm font-medium">Modern Image Conversion</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Support for WebP (30% smaller) and AVIF (50% smaller)</li>
              <li>✓ Batch conversion with drag & drop</li>
              <li>✓ Client-side processing - no uploads required</li>
              <li>✓ Advanced resize and quality controls</li>
              <li>✓ Format-specific optimizations</li>
              <li>✓ Transparency and background color handling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}