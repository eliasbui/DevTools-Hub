import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { useToast } from '@/hooks/use-toast';
import { Palette, RefreshCw, Download } from 'lucide-react';

interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
  name: string;
}

export function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [paletteType, setPaletteType] = useState<'complementary' | 'triadic' | 'analogous' | 'monochromatic' | 'tetradic'>('complementary');
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const { toast } = useToast();

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generateColorName = (hex: string) => {
    const colors: Record<string, string> = {
      '#ff0000': 'Red',
      '#00ff00': 'Green',
      '#0000ff': 'Blue',
      '#ffff00': 'Yellow',
      '#ff00ff': 'Magenta',
      '#00ffff': 'Cyan',
      '#ffffff': 'White',
      '#000000': 'Black',
      '#808080': 'Gray',
      '#800000': 'Maroon',
      '#808000': 'Olive',
      '#008000': 'Dark Green',
      '#800080': 'Purple',
      '#008080': 'Teal',
      '#000080': 'Navy',
    };
    
    return colors[hex.toLowerCase()] || 'Custom Color';
  };

  const generatePalette = () => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors: ColorInfo[] = [];

    switch (paletteType) {
      case 'complementary':
        colors.push(
          createColorInfo(baseColor, 'Primary'),
          createColorInfo(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l), 'Complementary')
        );
        break;

      case 'triadic':
        colors.push(
          createColorInfo(baseColor, 'Primary'),
          createColorInfo(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l), 'Triadic 1'),
          createColorInfo(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l), 'Triadic 2')
        );
        break;

      case 'analogous':
        colors.push(
          createColorInfo(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l), 'Analogous 1'),
          createColorInfo(baseColor, 'Primary'),
          createColorInfo(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l), 'Analogous 2')
        );
        break;

      case 'monochromatic':
        colors.push(
          createColorInfo(hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 40, 10)), 'Dark'),
          createColorInfo(hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 20)), 'Medium Dark'),
          createColorInfo(baseColor, 'Primary'),
          createColorInfo(hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 90)), 'Light'),
          createColorInfo(hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 40, 95)), 'Very Light')
        );
        break;

      case 'tetradic':
        colors.push(
          createColorInfo(baseColor, 'Primary'),
          createColorInfo(hslToHex((hsl.h + 60) % 360, hsl.s, hsl.l), 'Tetradic 1'),
          createColorInfo(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l), 'Complementary'),
          createColorInfo(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l), 'Tetradic 2')
        );
        break;
    }

    setPalette(colors);
  };

  const createColorInfo = (hex: string, name: string): ColorInfo => {
    const rgb = hexToRgb(hex);
    if (!rgb) return { hex, rgb: '', hsl: '', name };

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      name
    };
  };

  const exportPalette = (format: 'css' | 'scss' | 'json') => {
    let output = '';
    
    switch (format) {
      case 'css':
        output = ':root {\n' + palette.map((color, index) => 
          `  --color-${index + 1}: ${color.hex};`
        ).join('\n') + '\n}';
        break;
        
      case 'scss':
        output = palette.map((color, index) => 
          `$color-${index + 1}: ${color.hex};`
        ).join('\n');
        break;
        
      case 'json':
        output = JSON.stringify(
          palette.reduce((acc, color, index) => {
            acc[`color-${index + 1}`] = color.hex;
            return acc;
          }, {} as Record<string, string>),
          null,
          2
        );
        break;
    }
    
    navigator.clipboard.writeText(output);
    toast({
      title: "Exported!",
      description: `Palette exported as ${format.toUpperCase()}`,
    });
  };

  const randomizeColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 50) + 50; // 50-100%
    const lightness = Math.floor(Math.random() * 40) + 30; // 30-70%
    setBaseColor(hslToHex(hue, saturation, lightness));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-primary" />
          <span>Color Palette Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Color</label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Harmony Type</label>
              <Select value={paletteType} onValueChange={setPaletteType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complementary">Complementary</SelectItem>
                  <SelectItem value="triadic">Triadic</SelectItem>
                  <SelectItem value="analogous">Analogous</SelectItem>
                  <SelectItem value="monochromatic">Monochromatic</SelectItem>
                  <SelectItem value="tetradic">Tetradic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex space-x-2">
                <Button onClick={generatePalette} className="flex-1">
                  Generate
                </Button>
                <Button onClick={randomizeColor} variant="outline" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Palette Display */}
          {palette.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Generated Palette</h3>
                <div className="flex space-x-2">
                  <Button onClick={() => exportPalette('css')} variant="outline" size="sm">
                    Export CSS
                  </Button>
                  <Button onClick={() => exportPalette('scss')} variant="outline" size="sm">
                    Export SCSS
                  </Button>
                  <Button onClick={() => exportPalette('json')} variant="outline" size="sm">
                    Export JSON
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {palette.map((color, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div 
                      className="h-24 w-full cursor-pointer"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => {
                        navigator.clipboard.writeText(color.hex);
                        toast({
                          title: "Copied!",
                          description: `${color.hex} copied to clipboard`,
                        });
                      }}
                    />
                    <div className="p-3 space-y-2">
                      <div className="font-medium">{color.name}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-mono">{color.hex}</span>
                          <CopyButton text={color.hex} size="sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-muted-foreground">{color.rgb}</span>
                          <CopyButton text={color.rgb} size="sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-muted-foreground">{color.hsl}</span>
                          <CopyButton text={color.hsl} size="sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Theory Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Color Harmony Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Complementary</h4>
                <p className="text-muted-foreground">Colors opposite each other on the color wheel. Creates high contrast and vibrant designs.</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Triadic</h4>
                <p className="text-muted-foreground">Three colors evenly spaced on the color wheel. Vibrant yet balanced.</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Analogous</h4>
                <p className="text-muted-foreground">Colors next to each other on the color wheel. Creates serene and comfortable designs.</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Monochromatic</h4>
                <p className="text-muted-foreground">Different shades, tints, and tones of a single color. Creates cohesive designs.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}