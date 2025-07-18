import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, RefreshCw, Shuffle, Eye, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useClipboard } from '@/hooks/useClipboard';

interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
  lab: { l: number; a: number; b: number };
}

export function ColorConverter() {
  const { toast } = useToast();
  const { copyToClipboard } = useClipboard();
  const [color, setColor] = useState('#3b82f6');
  const [colorValues, setColorValues] = useState<ColorValues | null>(null);
  const [inputFormat, setInputFormat] = useState('hex');
  const [inputValue, setInputValue] = useState('#3b82f6');

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

  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
  };

  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
    
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  const rgbToLab = (r: number, g: number, b: number): { l: number; a: number; b: number } => {
    // Convert RGB to XYZ
    r /= 255;
    g /= 255;
    b /= 255;
    
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    
    let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    
    return {
      l: Math.round((116 * y) - 16),
      a: Math.round(500 * (x - y)),
      b: Math.round(200 * (y - z))
    };
  };

  const parseColorInput = (value: string, format: string): string | null => {
    try {
      switch (format) {
        case 'hex':
          if (/^#[0-9A-F]{6}$/i.test(value)) {
            return value;
          }
          break;
        case 'rgb':
          const rgbMatch = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            if (r <= 255 && g <= 255 && b <= 255) {
              return rgbToHex(r, g, b);
            }
          }
          break;
        case 'hsl':
          const hslMatch = value.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
          if (hslMatch) {
            const h = parseInt(hslMatch[1]);
            const s = parseInt(hslMatch[2]);
            const l = parseInt(hslMatch[3]);
            if (h <= 360 && s <= 100 && l <= 100) {
              const rgb = hslToRgb(h, s, l);
              return rgbToHex(rgb.r, rgb.g, rgb.b);
            }
          }
          break;
      }
      return null;
    } catch {
      return null;
    }
  };

  const convertColor = (hexColor: string): ColorValues => {
    const rgb = hexToRgb(hexColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const lab = rgbToLab(rgb.r, rgb.g, rgb.b);

    return {
      hex: hexColor,
      rgb,
      hsl,
      hsv,
      cmyk,
      lab
    };
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const parsedColor = parseColorInput(value, inputFormat);
    if (parsedColor) {
      setColor(parsedColor);
    }
  };

  const copyValue = (value: string, format: string) => {
    copyToClipboard(value);
    toast({
      title: "Color copied",
      description: `${format} value copied to clipboard`
    });
  };

  const generateRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setColor(randomColor);
    setInputValue(randomColor);
  };

  useEffect(() => {
    setColorValues(convertColor(color));
  }, [color]);

  useEffect(() => {
    if (inputFormat === 'hex') {
      setInputValue(color);
    }
  }, [inputFormat, color]);

  const formatOptions = [
    { value: 'hex', label: 'HEX' },
    { value: 'rgb', label: 'RGB' },
    { value: 'hsl', label: 'HSL' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Converter
          </CardTitle>
          <CardDescription>
            Convert colors between different formats (HEX, RGB, HSL, HSV, CMYK, LAB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Input */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="color-input">Color Input</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      setInputValue(e.target.value);
                    }}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    id="color-input"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Enter color value"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={generateRandomColor}
                    title="Generate random color"
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                {formatOptions.map((format) => (
                  <Button
                    key={format.value}
                    variant={inputFormat === format.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputFormat(format.value)}
                  >
                    {format.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Color Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Color Preview</h3>
            <div className="flex items-center gap-4">
              <motion.div
                className="w-32 h-32 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg"
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
              <div className="flex-1 space-y-2">
                <div className="text-2xl font-bold">{color}</div>
                <div className="text-sm text-muted-foreground">
                  Click any value below to copy to clipboard
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Color Values */}
          {colorValues && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Color Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* HEX */}
                <Card 
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => copyValue(colorValues.hex, 'HEX')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">HEX</div>
                        <div className="text-sm text-muted-foreground">Hexadecimal</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg">{colorValues.hex}</div>
                        <Copy className="w-4 h-4 ml-auto text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* RGB */}
                <Card 
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => copyValue(`rgb(${colorValues.rgb.r}, ${colorValues.rgb.g}, ${colorValues.rgb.b})`, 'RGB')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">RGB</div>
                        <div className="text-sm text-muted-foreground">Red Green Blue</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg">
                          {colorValues.rgb.r}, {colorValues.rgb.g}, {colorValues.rgb.b}
                        </div>
                        <Copy className="w-4 h-4 ml-auto text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* HSL */}
                <Card 
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => copyValue(`hsl(${colorValues.hsl.h}, ${colorValues.hsl.s}%, ${colorValues.hsl.l}%)`, 'HSL')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">HSL</div>
                        <div className="text-sm text-muted-foreground">Hue Saturation Lightness</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg">
                          {colorValues.hsl.h}°, {colorValues.hsl.s}%, {colorValues.hsl.l}%
                        </div>
                        <Copy className="w-4 h-4 ml-auto text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* HSV */}
                <Card 
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => copyValue(`hsv(${colorValues.hsv.h}, ${colorValues.hsv.s}%, ${colorValues.hsv.v}%)`, 'HSV')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">HSV</div>
                        <div className="text-sm text-muted-foreground">Hue Saturation Value</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg">
                          {colorValues.hsv.h}°, {colorValues.hsv.s}%, {colorValues.hsv.v}%
                        </div>
                        <Copy className="w-4 h-4 ml-auto text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CMYK */}
                <Card 
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => copyValue(`cmyk(${colorValues.cmyk.c}%, ${colorValues.cmyk.m}%, ${colorValues.cmyk.y}%, ${colorValues.cmyk.k}%)`, 'CMYK')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">CMYK</div>
                        <div className="text-sm text-muted-foreground">Cyan Magenta Yellow Key</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg">
                          {colorValues.cmyk.c}%, {colorValues.cmyk.m}%, {colorValues.cmyk.y}%, {colorValues.cmyk.k}%
                        </div>
                        <Copy className="w-4 h-4 ml-auto text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* LAB */}
                <Card 
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => copyValue(`lab(${colorValues.lab.l}%, ${colorValues.lab.a}, ${colorValues.lab.b})`, 'LAB')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">LAB</div>
                        <div className="text-sm text-muted-foreground">Lightness A B</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg">
                          {colorValues.lab.l}%, {colorValues.lab.a}, {colorValues.lab.b}
                        </div>
                        <Copy className="w-4 h-4 ml-auto text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Color Variations */}
          {colorValues && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Color Variations</h3>
              <div className="grid grid-cols-5 gap-2">
                {/* Lightness variations */}
                {[-40, -20, 0, 20, 40].map((adjustment, index) => {
                  const adjustedL = Math.max(0, Math.min(100, colorValues.hsl.l + adjustment));
                  const adjustedRgb = hslToRgb(colorValues.hsl.h, colorValues.hsl.s, adjustedL);
                  const adjustedHex = rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
                  
                  return (
                    <motion.div
                      key={index}
                      className="relative group"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className="w-full h-16 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
                        style={{ backgroundColor: adjustedHex }}
                        onClick={() => copyValue(adjustedHex, 'HEX')}
                        title={`Lightness ${adjustment > 0 ? '+' : ''}${adjustment}%`}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <Copy className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}