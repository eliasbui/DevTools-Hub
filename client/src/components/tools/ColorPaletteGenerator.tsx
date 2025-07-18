import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, RefreshCw, Eye, Palette, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useClipboard } from '@/hooks/useClipboard';

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name: string;
}

type PaletteType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic' | 'split-complementary';

const paletteTypes = {
  complementary: 'Complementary',
  analogous: 'Analogous',
  triadic: 'Triadic',
  tetradic: 'Tetradic',
  monochromatic: 'Monochromatic',
  'split-complementary': 'Split Complementary'
};

export function ColorPaletteGenerator() {
  const { toast } = useToast();
  const { copyToClipboard } = useClipboard();
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [paletteType, setPaletteType] = useState<PaletteType>('complementary');
  const [colorCount, setColorCount] = useState([5]);
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Color conversion utilities
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  const getColorName = (hex: string): string => {
    const rgb = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Simple color naming based on HSL
    if (s < 10) return l < 20 ? 'Dark Gray' : l > 80 ? 'Light Gray' : 'Gray';
    if (l < 20) return 'Very Dark';
    if (l > 90) return 'Very Light';
    
    const hueRanges = [
      { min: 0, max: 15, name: 'Red' },
      { min: 16, max: 45, name: 'Orange' },
      { min: 46, max: 75, name: 'Yellow' },
      { min: 76, max: 150, name: 'Green' },
      { min: 151, max: 200, name: 'Cyan' },
      { min: 201, max: 250, name: 'Blue' },
      { min: 251, max: 300, name: 'Purple' },
      { min: 301, max: 330, name: 'Pink' },
      { min: 331, max: 360, name: 'Red' }
    ];

    const range = hueRanges.find(r => h >= r.min && h <= r.max);
    return range ? range.name : 'Unknown';
  };

  const generatePalette = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const baseRgb = hexToRgb(baseColor);
      const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
      const colors: ColorInfo[] = [];
      const count = colorCount[0];

      switch (paletteType) {
        case 'complementary':
          colors.push(createColorInfo(baseColor));
          for (let i = 1; i < count; i++) {
            const hue = (baseHsl.h + 180 + (i - 1) * 30) % 360;
            const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
            colors.push(createColorInfo(rgbToHex(rgb.r, rgb.g, rgb.b)));
          }
          break;

        case 'analogous':
          for (let i = 0; i < count; i++) {
            const hue = (baseHsl.h + i * 30) % 360;
            const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
            colors.push(createColorInfo(rgbToHex(rgb.r, rgb.g, rgb.b)));
          }
          break;

        case 'triadic':
          for (let i = 0; i < Math.min(count, 3); i++) {
            const hue = (baseHsl.h + i * 120) % 360;
            const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
            colors.push(createColorInfo(rgbToHex(rgb.r, rgb.g, rgb.b)));
          }
          // Fill remaining with variations
          for (let i = 3; i < count; i++) {
            const baseIdx = i % 3;
            const variation = colors[baseIdx];
            const rgb = hslToRgb(variation.hsl.h, variation.hsl.s, Math.max(20, variation.hsl.l - 20));
            colors.push(createColorInfo(rgbToHex(rgb.r, rgb.g, rgb.b)));
          }
          break;

        case 'tetradic':
          for (let i = 0; i < Math.min(count, 4); i++) {
            const hue = (baseHsl.h + i * 90) % 360;
            const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
            colors.push(createColorInfo(rgbToHex(rgb.r, rgb.g, rgb.b)));
          }
          // Fill remaining with variations
          for (let i = 4; i < count; i++) {
            const baseIdx = i % 4;
            const variation = colors[baseIdx];
            const rgb = hslToRgb(variation.hsl.h, variation.hsl.s, Math.max(20, variation.hsl.l - 15));
            colors.push(createColorInfo(rgbToHex(rgb.r, rgb.g, rgb.b)));
          }
          break;

        case 'monochromatic':
          for (let i = 0; i < count; i++) {
            const lightness = Math.max(10, Math.min(90, baseHsl.l + (i - count/2) * 20));
            const rgb = hslToRgb(baseHsl.h, baseHsl.s, lightness);
            colors.push(createColorInfo(rgbToHex(rgb.r, rgb.g, rgb.b)));
          }
          break;

        case 'split-complementary':
          colors.push(createColorInfo(baseColor));
          const comp1 = (baseHsl.h + 150) % 360;
          const comp2 = (baseHsl.h + 210) % 360;
          colors.push(createColorInfo(rgbToHex(...Object.values(hslToRgb(comp1, baseHsl.s, baseHsl.l)))));
          colors.push(createColorInfo(rgbToHex(...Object.values(hslToRgb(comp2, baseHsl.s, baseHsl.l)))));
          
          // Fill remaining with variations
          for (let i = 3; i < count; i++) {
            const baseIdx = i % 3;
            const variation = colors[baseIdx];
            const rgb = hslToRgb(variation.hsl.h, Math.max(20, variation.hsl.s - 20), variation.hsl.l);
            colors.push(createColorInfo(rgbToHex(rgb.r, rgb.g, rgb.b)));
          }
          break;
      }

      setPalette(colors);
      setIsGenerating(false);
    }, 500);
  };

  const createColorInfo = (hex: string): ColorInfo => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return {
      hex,
      rgb,
      hsl,
      name: getColorName(hex)
    };
  };

  const copyColor = (color: ColorInfo, format: 'hex' | 'rgb' | 'hsl') => {
    let value = '';
    switch (format) {
      case 'hex':
        value = color.hex;
        break;
      case 'rgb':
        value = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
        break;
      case 'hsl':
        value = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
        break;
    }
    copyToClipboard(value);
    toast({
      title: "Color copied",
      description: `${value} copied to clipboard`
    });
  };

  const exportPalette = () => {
    const paletteData = {
      type: paletteType,
      baseColor,
      colors: palette.map(color => ({
        hex: color.hex,
        rgb: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
        hsl: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
        name: color.name
      }))
    };

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-palette-${paletteType}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Palette exported",
      description: "Color palette exported as JSON"
    });
  };

  const randomizeBaseColor = () => {
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setBaseColor(randomColor);
  };

  useEffect(() => {
    generatePalette();
  }, [baseColor, paletteType, colorCount]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Palette Generator
          </CardTitle>
          <CardDescription>
            Generate beautiful color palettes using color theory principles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base-color">Base Color</Label>
              <div className="flex gap-2">
                <Input
                  id="base-color"
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={randomizeBaseColor}
                  title="Random color"
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="palette-type">Palette Type</Label>
              <Select value={paletteType} onValueChange={(value) => setPaletteType(value as PaletteType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(paletteTypes).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color-count">Colors: {colorCount[0]}</Label>
              <Slider
                id="color-count"
                min={3}
                max={10}
                step={1}
                value={colorCount}
                onValueChange={setColorCount}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generatePalette} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Palette
                </>
              )}
            </Button>
            <Button variant="outline" onClick={exportPalette} disabled={palette.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>

          <Separator />

          {/* Palette Display */}
          <AnimatePresence mode="wait">
            {palette.length > 0 && (
              <motion.div
                key="palette"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Large Color Swatches */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {palette.map((color, index) => (
                    <motion.div
                      key={`${color.hex}-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div
                        className="w-full h-20 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColor(color, 'hex')}
                        title="Click to copy HEX"
                      />
                      <div className="text-center">
                        <div className="font-medium text-sm">{color.name}</div>
                        <div className="text-xs text-muted-foreground">{color.hex}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Color Details */}
                <div className="space-y-3">
                  {palette.map((color, index) => (
                    <motion.div
                      key={`details-${color.hex}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted"
                    >
                      <div
                        className="w-12 h-12 rounded-md border-2 border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <div className="text-sm font-medium">{color.name}</div>
                          <div className="text-xs text-muted-foreground">Color Name</div>
                        </div>
                        <div 
                          className="cursor-pointer rounded p-1 transition-colors"
                          onClick={() => copyColor(color, 'hex')}
                        >
                          <div className="text-sm font-mono">{color.hex}</div>
                          <div className="text-xs text-muted-foreground">HEX</div>
                        </div>
                        <div 
                          className="cursor-pointer rounded p-1 transition-colors"
                          onClick={() => copyColor(color, 'rgb')}
                        >
                          <div className="text-sm font-mono">
                            {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                          </div>
                          <div className="text-xs text-muted-foreground">RGB</div>
                        </div>
                        <div 
                          className="cursor-pointer rounded p-1 transition-colors"
                          onClick={() => copyColor(color, 'hsl')}
                        >
                          <div className="text-sm font-mono">
                            {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                          </div>
                          <div className="text-xs text-muted-foreground">HSL</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}