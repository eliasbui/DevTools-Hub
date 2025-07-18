import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileImage, Upload, Download, Zap, Settings, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/common/CopyButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface OptimizationOptions {
  removeComments: boolean;
  removeMetadata: boolean;
  removeEmptyGroups: boolean;
  removeHiddenElements: boolean;
  removeUnusedDefs: boolean;
  removeViewBox: boolean;
  removeTitle: boolean;
  removeDesc: boolean;
  collapseGroups: boolean;
  convertPathData: boolean;
  convertTransforms: boolean;
  removeDefaultAttributes: boolean;
  cleanupNumericValues: boolean;
  removeNonInheritableGroupAttrs: boolean;
  moveGroupAttrsToElems: boolean;
  precision: number;
}

interface OptimizationStats {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
  elementsRemoved: number;
  attributesRemoved: number;
}

export function SVGOptimizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<OptimizationStats | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<OptimizationOptions>({
    removeComments: true,
    removeMetadata: true,
    removeEmptyGroups: true,
    removeHiddenElements: true,
    removeUnusedDefs: true,
    removeViewBox: false,
    removeTitle: false,
    removeDesc: false,
    collapseGroups: true,
    convertPathData: true,
    convertTransforms: true,
    removeDefaultAttributes: true,
    cleanupNumericValues: true,
    removeNonInheritableGroupAttrs: true,
    moveGroupAttrsToElems: true,
    precision: 2
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('svg')) {
      setError('Please select an SVG file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);
      setPreview(content);
    };
    reader.readAsText(file);
  };

  const optimizeSVG = () => {
    setError('');
    setOutput('');
    setStats(null);
    setLoading(true);
    
    try {
      if (!input.trim()) {
        throw new Error('Please enter or upload an SVG');
      }
      
      // Parse SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'image/svg+xml');
      const errorNode = doc.querySelector('parsererror');
      
      if (errorNode) {
        throw new Error('Invalid SVG format');
      }
      
      const svg = doc.documentElement;
      let elementsRemoved = 0;
      let attributesRemoved = 0;
      
      // Remove comments
      if (options.removeComments) {
        const walker = document.createTreeWalker(
          svg,
          NodeFilter.SHOW_COMMENT,
          null
        );
        const comments: Comment[] = [];
        let node;
        while (node = walker.nextNode()) {
          comments.push(node as Comment);
        }
        comments.forEach(comment => {
          comment.remove();
          elementsRemoved++;
        });
      }
      
      // Remove metadata
      if (options.removeMetadata) {
        svg.querySelectorAll('metadata').forEach(el => {
          el.remove();
          elementsRemoved++;
        });
      }
      
      // Remove title
      if (options.removeTitle) {
        svg.querySelectorAll('title').forEach(el => {
          el.remove();
          elementsRemoved++;
        });
      }
      
      // Remove desc
      if (options.removeDesc) {
        svg.querySelectorAll('desc').forEach(el => {
          el.remove();
          elementsRemoved++;
        });
      }
      
      // Remove empty groups
      if (options.removeEmptyGroups) {
        svg.querySelectorAll('g').forEach(group => {
          if (!group.hasChildNodes() || group.children.length === 0) {
            group.remove();
            elementsRemoved++;
          }
        });
      }
      
      // Remove hidden elements
      if (options.removeHiddenElements) {
        svg.querySelectorAll('[display="none"], [visibility="hidden"], [opacity="0"]').forEach(el => {
          el.remove();
          elementsRemoved++;
        });
      }
      
      // Remove unused defs
      if (options.removeUnusedDefs) {
        const defs = svg.querySelectorAll('defs > *[id]');
        defs.forEach(def => {
          const id = def.getAttribute('id');
          if (id && !svg.querySelector(`[*|href="#${id}"], [fill="url(#${id})"], [stroke="url(#${id})"]`)) {
            def.remove();
            elementsRemoved++;
          }
        });
      }
      
      // Clean up numeric values
      if (options.cleanupNumericValues) {
        const precision = options.precision;
        const numericAttrs = ['x', 'y', 'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 
                              'x1', 'y1', 'x2', 'y2', 'stroke-width', 'font-size'];
        
        svg.querySelectorAll('*').forEach(el => {
          numericAttrs.forEach(attr => {
            const value = el.getAttribute(attr);
            if (value) {
              const num = parseFloat(value);
              if (!isNaN(num)) {
                el.setAttribute(attr, num.toFixed(precision).replace(/\.?0+$/, ''));
              }
            }
          });
        });
      }
      
      // Convert path data
      if (options.convertPathData && options.precision) {
        svg.querySelectorAll('path').forEach(path => {
          const d = path.getAttribute('d');
          if (d) {
            // Simple path optimization - remove extra spaces and round numbers
            const optimized = d
              .replace(/\s+/g, ' ')
              .replace(/(\d+\.\d{3,})/g, (match) => {
                return parseFloat(match).toFixed(options.precision);
              })
              .trim();
            path.setAttribute('d', optimized);
          }
        });
      }
      
      // Remove default attributes
      if (options.removeDefaultAttributes) {
        const defaults: Record<string, string> = {
          'fill-opacity': '1',
          'stroke-opacity': '1',
          'opacity': '1',
          'stroke-miterlimit': '4',
          'stroke-linecap': 'butt',
          'stroke-linejoin': 'miter'
        };
        
        svg.querySelectorAll('*').forEach(el => {
          Object.entries(defaults).forEach(([attr, defaultValue]) => {
            if (el.getAttribute(attr) === defaultValue) {
              el.removeAttribute(attr);
              attributesRemoved++;
            }
          });
        });
      }
      
      // Convert transforms
      if (options.convertTransforms) {
        svg.querySelectorAll('[transform]').forEach(el => {
          const transform = el.getAttribute('transform');
          if (transform && transform.includes('translate(0') && !transform.includes('rotate') && !transform.includes('scale')) {
            el.removeAttribute('transform');
            attributesRemoved++;
          }
        });
      }
      
      // Serialize back to string
      const serializer = new XMLSerializer();
      let optimized = serializer.serializeToString(svg);
      
      // Additional string-based optimizations
      optimized = optimized
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/> </g, '><') // Remove spaces between tags
        .replace(/;\s*}/g, '}') // Remove trailing semicolons in styles
        .replace(/:\s+/g, ':') // Remove spaces after colons
        .replace(/,\s+/g, ',') // Remove spaces after commas
        .trim();
      
      setOutput(optimized);
      setPreview(optimized);
      
      // Calculate stats
      const originalSize = new Blob([input]).size;
      const optimizedSize = new Blob([optimized]).size;
      const savings = originalSize - optimizedSize;
      const savingsPercent = Math.round((savings / originalSize) * 100);
      
      setStats({
        originalSize,
        optimizedSize,
        savings,
        savingsPercent,
        elementsRemoved,
        attributesRemoved
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize SVG');
    } finally {
      setLoading(false);
    }
  };

  const downloadSVG = () => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
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
              <FileImage className="w-5 h-5" />
            </motion.div>
            <span>SVG Optimizer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".svg,image/svg+xml"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full animate-pulse-hover"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload SVG File
            </Button>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>SVG Code</Label>
              {input && (
                <Badge variant="secondary">{formatBytes(new Blob([input]).size)}</Badge>
              )}
            </div>
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setPreview(e.target.value);
              }}
              placeholder="Paste your SVG code here or upload a file..."
              className="font-mono text-xs h-[150px]"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <Label className="text-sm mb-2 block">Preview</Label>
              <div 
                className="max-h-[200px] overflow-auto flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </div>
          )}

          {/* Options */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium">Optimization Options</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="removeComments" className="text-sm">Remove comments</Label>
                <Switch
                  id="removeComments"
                  checked={options.removeComments}
                  onCheckedChange={(checked) => setOptions({ ...options, removeComments: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="removeMetadata" className="text-sm">Remove metadata</Label>
                <Switch
                  id="removeMetadata"
                  checked={options.removeMetadata}
                  onCheckedChange={(checked) => setOptions({ ...options, removeMetadata: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="removeEmptyGroups" className="text-sm">Remove empty groups</Label>
                <Switch
                  id="removeEmptyGroups"
                  checked={options.removeEmptyGroups}
                  onCheckedChange={(checked) => setOptions({ ...options, removeEmptyGroups: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="removeHiddenElements" className="text-sm">Remove hidden elements</Label>
                <Switch
                  id="removeHiddenElements"
                  checked={options.removeHiddenElements}
                  onCheckedChange={(checked) => setOptions({ ...options, removeHiddenElements: checked })}
                />
              </div>
            </div>

            {/* Advanced Options */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:text-primary">
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                Advanced Options
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="removeUnusedDefs" className="text-sm">Remove unused defs</Label>
                    <Switch
                      id="removeUnusedDefs"
                      checked={options.removeUnusedDefs}
                      onCheckedChange={(checked) => setOptions({ ...options, removeUnusedDefs: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="removeTitle" className="text-sm">Remove title</Label>
                    <Switch
                      id="removeTitle"
                      checked={options.removeTitle}
                      onCheckedChange={(checked) => setOptions({ ...options, removeTitle: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="convertPathData" className="text-sm">Optimize paths</Label>
                    <Switch
                      id="convertPathData"
                      checked={options.convertPathData}
                      onCheckedChange={(checked) => setOptions({ ...options, convertPathData: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cleanupNumericValues" className="text-sm">Clean numeric values</Label>
                    <Switch
                      id="cleanupNumericValues"
                      checked={options.cleanupNumericValues}
                      onCheckedChange={(checked) => setOptions({ ...options, cleanupNumericValues: checked })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Decimal Precision ({options.precision})</Label>
                  <Slider
                    value={[options.precision]}
                    onValueChange={([value]) => setOptions({ ...options, precision: value })}
                    min={0}
                    max={5}
                    step={1}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Optimize Button */}
          <Button
            onClick={optimizeSVG}
            disabled={!input.trim() || loading}
            className="w-full animate-pulse-hover"
          >
            <Zap className="w-4 h-4 mr-2" />
            Optimize SVG
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
            {stats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-muted rounded-lg"
              >
                <h4 className="text-sm font-medium mb-2">Optimization Results</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Original</p>
                    <p className="font-mono">{formatBytes(stats.originalSize)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Optimized</p>
                    <p className="font-mono">{formatBytes(stats.optimizedSize)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Saved</p>
                    <p className="font-mono text-green-600 dark:text-green-400">
                      {formatBytes(stats.savings)} ({stats.savingsPercent}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Elements Removed</p>
                    <p className="font-mono">{stats.elementsRemoved}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attributes Removed</p>
                    <p className="font-mono">{stats.attributesRemoved}</p>
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
                  <Label>Optimized SVG</Label>
                  <div className="flex items-center gap-2">
                    {output && (
                      <Badge variant="secondary">{formatBytes(new Blob([output]).size)}</Badge>
                    )}
                    <CopyButton value={output} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadSVG}
                      className="animate-pulse-hover"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={output}
                  readOnly
                  className="font-mono text-xs h-[150px]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="text-sm font-medium">SVG Optimization Features</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Remove unnecessary elements, attributes, and metadata</li>
              <li>• Optimize path data and numeric precision</li>
              <li>• Clean up unused definitions and empty groups</li>
              <li>• Visual preview of SVG before and after optimization</li>
              <li>• Customizable optimization options</li>
              <li>• Typical 30-80% file size reduction</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}