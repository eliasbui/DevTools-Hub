import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CopyButton } from '@/components/common/CopyButton';
import { Plus, Trash2, Eye } from 'lucide-react';

interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export function BoxShadowGenerator() {
  const [shadows, setShadows] = useState<ShadowLayer[]>([
    {
      id: '1',
      x: 0,
      y: 4,
      blur: 8,
      spread: 0,
      color: '#000000',
      opacity: 0.25,
      inset: false,
    },
  ]);

  const [previewBg, setPreviewBg] = useState('#f0f0f0');

  const addShadow = () => {
    const newShadow: ShadowLayer = {
      id: Date.now().toString(),
      x: 0,
      y: 2,
      blur: 4,
      spread: 0,
      color: '#000000',
      opacity: 0.2,
      inset: false,
    };
    setShadows([...shadows, newShadow]);
  };

  const removeShadow = (id: string) => {
    setShadows(shadows.filter(shadow => shadow.id !== id));
  };

  const updateShadow = (id: string, updates: Partial<ShadowLayer>) => {
    setShadows(shadows.map(shadow => 
      shadow.id === id ? { ...shadow, ...updates } : shadow
    ));
  };

  const generateCSS = () => {
    const shadowStrings = shadows.map(shadow => {
      const r = parseInt(shadow.color.slice(1, 3), 16);
      const g = parseInt(shadow.color.slice(3, 5), 16);
      const b = parseInt(shadow.color.slice(5, 7), 16);
      
      const shadowValue = `${shadow.inset ? 'inset ' : ''}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${r}, ${g}, ${b}, ${shadow.opacity})`;
      return shadowValue;
    });

    return `box-shadow: ${shadowStrings.join(', ')};`;
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const presetShadows = {
    'subtle': [
      { id: '1', x: 0, y: 1, blur: 3, spread: 0, color: '#000000', opacity: 0.12, inset: false },
      { id: '2', x: 0, y: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.24, inset: false },
    ],
    'medium': [
      { id: '1', x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 0.1, inset: false },
      { id: '2', x: 0, y: 2, blur: 4, spread: -1, color: '#000000', opacity: 0.06, inset: false },
    ],
    'large': [
      { id: '1', x: 0, y: 10, blur: 15, spread: -3, color: '#000000', opacity: 0.1, inset: false },
      { id: '2', x: 0, y: 4, blur: 6, spread: -2, color: '#000000', opacity: 0.05, inset: false },
    ],
    'neon': [
      { id: '1', x: 0, y: 0, blur: 5, spread: 0, color: '#00ff00', opacity: 0.6, inset: false },
      { id: '2', x: 0, y: 0, blur: 10, spread: 0, color: '#00ff00', opacity: 0.4, inset: false },
      { id: '3', x: 0, y: 0, blur: 15, spread: 0, color: '#00ff00', opacity: 0.2, inset: false },
    ],
  };

  const applyPreset = (preset: keyof typeof presetShadows) => {
    setShadows(presetShadows[preset]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-primary" />
          <span>Box Shadow Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => applyPreset('subtle')} variant="outline" size="sm">
              Subtle
            </Button>
            <Button onClick={() => applyPreset('medium')} variant="outline" size="sm">
              Medium
            </Button>
            <Button onClick={() => applyPreset('large')} variant="outline" size="sm">
              Large
            </Button>
            <Button onClick={() => applyPreset('neon')} variant="outline" size="sm">
              Neon
            </Button>
            <Button onClick={addShadow} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Layer
            </Button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Preview</h3>
              <div className="flex items-center space-x-2">
                <label className="text-sm">Background:</label>
                <Input
                  type="color"
                  value={previewBg}
                  onChange={(e) => setPreviewBg(e.target.value)}
                  className="w-16 h-8 p-1"
                />
              </div>
            </div>
            
            <div 
              className="flex items-center justify-center p-8 rounded-lg"
              style={{ backgroundColor: previewBg }}
            >
              <div
                className="w-32 h-32 bg-white rounded-lg flex items-center justify-center text-gray-600 font-medium"
                style={{ boxShadow: generateCSS().replace('box-shadow: ', '') }}
              >
                Preview
              </div>
            </div>
          </div>

          {/* Shadow Layers */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Shadow Layers</h3>
            {shadows.map((shadow, index) => (
              <div key={shadow.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Layer {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={shadow.inset}
                        onCheckedChange={(checked) => updateShadow(shadow.id, { inset: checked })}
                      />
                      <label className="text-sm">Inset</label>
                    </div>
                    {shadows.length > 1 && (
                      <Button
                        onClick={() => removeShadow(shadow.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">X Offset: {shadow.x}px</label>
                    <Slider
                      value={[shadow.x]}
                      onValueChange={([value]) => updateShadow(shadow.id, { x: value })}
                      min={-50}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Y Offset: {shadow.y}px</label>
                    <Slider
                      value={[shadow.y]}
                      onValueChange={([value]) => updateShadow(shadow.id, { y: value })}
                      min={-50}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Blur: {shadow.blur}px</label>
                    <Slider
                      value={[shadow.blur]}
                      onValueChange={([value]) => updateShadow(shadow.id, { blur: value })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Spread: {shadow.spread}px</label>
                    <Slider
                      value={[shadow.spread]}
                      onValueChange={([value]) => updateShadow(shadow.id, { spread: value })}
                      min={-50}
                      max={50}
                      step={1}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex space-x-2">
                      <Input
                        type="color"
                        value={shadow.color}
                        onChange={(e) => updateShadow(shadow.id, { color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={shadow.color}
                        onChange={(e) => updateShadow(shadow.id, { color: e.target.value })}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Opacity: {shadow.opacity}</label>
                    <Slider
                      value={[shadow.opacity]}
                      onValueChange={([value]) => updateShadow(shadow.id, { opacity: value })}
                      min={0}
                      max={1}
                      step={0.01}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Generated CSS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Generated CSS</h3>
              <CopyButton text={generateCSS()} />
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                {generateCSS()}
              </pre>
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Layer Order</h4>
                <p className="text-muted-foreground">Shadows are applied in order. The first shadow appears on top of subsequent shadows.</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Performance</h4>
                <p className="text-muted-foreground">Multiple shadows can impact performance. Consider using fewer layers for better performance.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}