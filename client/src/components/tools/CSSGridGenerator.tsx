import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { Grid, RefreshCw } from 'lucide-react';

interface GridItem {
  id: string;
  name: string;
  gridArea: string;
  color: string;
}

export function CSSGridGenerator() {
  const [rows, setRows] = useState([3]);
  const [columns, setColumns] = useState([3]);
  const [gap, setGap] = useState([16]);
  const [gridItems, setGridItems] = useState<GridItem[]>([
    { id: '1', name: 'Header', gridArea: '1 / 1 / 2 / 4', color: 'bg-blue-200' },
    { id: '2', name: 'Sidebar', gridArea: '2 / 1 / 3 / 2', color: 'bg-green-200' },
    { id: '3', name: 'Main', gridArea: '2 / 2 / 3 / 4', color: 'bg-yellow-200' },
    { id: '4', name: 'Footer', gridArea: '3 / 1 / 4 / 4', color: 'bg-purple-200' },
  ]);
  const [selectedItem, setSelectedItem] = useState<string>('1');
  const [gridTemplate, setGridTemplate] = useState('1fr 1fr 1fr');

  const generateGridCSS = () => {
    const containerCSS = `.grid-container {
  display: grid;
  grid-template-columns: ${gridTemplate};
  grid-template-rows: ${gridTemplate};
  gap: ${gap[0]}px;
  height: 100vh;
  padding: 20px;
}`;

    const itemsCSS = gridItems.map(item => 
      `.grid-item-${item.id} {
  grid-area: ${item.gridArea};
  background-color: var(--color-${item.id});
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}`
    ).join('\n\n');

    return `${containerCSS}\n\n${itemsCSS}`;
  };

  const generateGridHTML = () => {
    return `<div class="grid-container">
${gridItems.map(item => 
  `  <div class="grid-item-${item.id}">${item.name}</div>`
).join('\n')}
</div>`;
  };

  const updateGridArea = (itemId: string, newGridArea: string) => {
    setGridItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, gridArea: newGridArea }
          : item
      )
    );
  };

  const addGridItem = () => {
    const newId = (gridItems.length + 1).toString();
    const colors = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200', 'bg-indigo-200'];
    const newItem: GridItem = {
      id: newId,
      name: `Item ${newId}`,
      gridArea: '1 / 1 / 2 / 2',
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setGridItems(prev => [...prev, newItem]);
  };

  const removeGridItem = (itemId: string) => {
    setGridItems(prev => prev.filter(item => item.id !== itemId));
  };

  const presetLayouts = {
    'basic': {
      template: '1fr 1fr 1fr',
      items: [
        { id: '1', name: 'Header', gridArea: '1 / 1 / 2 / 4', color: 'bg-blue-200' },
        { id: '2', name: 'Sidebar', gridArea: '2 / 1 / 3 / 2', color: 'bg-green-200' },
        { id: '3', name: 'Main', gridArea: '2 / 2 / 3 / 4', color: 'bg-yellow-200' },
        { id: '4', name: 'Footer', gridArea: '3 / 1 / 4 / 4', color: 'bg-purple-200' },
      ]
    },
    'sidebar': {
      template: '250px 1fr',
      items: [
        { id: '1', name: 'Sidebar', gridArea: '1 / 1 / 3 / 2', color: 'bg-blue-200' },
        { id: '2', name: 'Header', gridArea: '1 / 2 / 2 / 3', color: 'bg-green-200' },
        { id: '3', name: 'Main', gridArea: '2 / 2 / 3 / 3', color: 'bg-yellow-200' },
      ]
    },
    'dashboard': {
      template: '1fr 1fr 1fr 1fr',
      items: [
        { id: '1', name: 'Header', gridArea: '1 / 1 / 2 / 5', color: 'bg-blue-200' },
        { id: '2', name: 'Nav', gridArea: '2 / 1 / 3 / 2', color: 'bg-green-200' },
        { id: '3', name: 'Card 1', gridArea: '2 / 2 / 3 / 3', color: 'bg-yellow-200' },
        { id: '4', name: 'Card 2', gridArea: '2 / 3 / 3 / 4', color: 'bg-purple-200' },
        { id: '5', name: 'Card 3', gridArea: '2 / 4 / 3 / 5', color: 'bg-pink-200' },
      ]
    }
  };

  const applyPreset = (preset: keyof typeof presetLayouts) => {
    const layout = presetLayouts[preset];
    setGridTemplate(layout.template);
    setGridItems(layout.items);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Grid className="w-5 h-5 text-primary" />
          <span>CSS Grid Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Grid Template</label>
              <Input
                value={gridTemplate}
                onChange={(e) => setGridTemplate(e.target.value)}
                placeholder="e.g. 1fr 1fr 1fr"
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Gap: {gap[0]}px</label>
              <Slider
                value={gap}
                onValueChange={setGap}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preset Layouts</label>
              <Select onValueChange={(value) => applyPreset(value as keyof typeof presetLayouts)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Layout</SelectItem>
                  <SelectItem value="sidebar">Sidebar Layout</SelectItem>
                  <SelectItem value="dashboard">Dashboard Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Grid Preview</h3>
              <div className="flex space-x-2">
                <Button onClick={addGridItem} variant="outline" size="sm">
                  Add Item
                </Button>
              </div>
            </div>
            
            <div 
              className="border rounded-lg p-4 min-h-[300px] bg-gray-50 dark:bg-gray-900"
              style={{
                display: 'grid',
                gridTemplateColumns: gridTemplate,
                gridTemplateRows: gridTemplate,
                gap: `${gap[0]}px`,
              }}
            >
              {gridItems.map((item) => (
                <div
                  key={item.id}
                  className={`${item.color} border-2 rounded-lg p-2 flex items-center justify-center font-medium cursor-pointer transition-all hover:opacity-80 ${
                    selectedItem === item.id ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{ gridArea: item.gridArea }}
                  onClick={() => setSelectedItem(item.id)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          {/* Item Editor */}
          {selectedItem && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Edit Selected Item</h3>
              {gridItems.filter(item => item.id === selectedItem).map(item => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={item.name}
                      onChange={(e) => setGridItems(prev => 
                        prev.map(i => i.id === item.id ? { ...i, name: e.target.value } : i)
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grid Area</label>
                    <Input
                      value={item.gridArea}
                      onChange={(e) => updateGridArea(item.id, e.target.value)}
                      placeholder="e.g. 1 / 1 / 2 / 3"
                      className="font-mono text-xs md:text-sm"
                    />
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2 flex justify-end">
                    <Button
                      onClick={() => removeGridItem(item.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove Item
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Generated Code */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Code</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">CSS</label>
                  <CopyButton text={generateGridCSS()} />
                </div>
                <div className="p-4 border rounded-lg bg-muted/50 max-h-96 overflow-auto">
                  <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                    {generateGridCSS()}
                  </pre>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">HTML</label>
                  <CopyButton text={generateGridHTML()} />
                </div>
                <div className="p-4 border rounded-lg bg-muted/50 max-h-96 overflow-auto">
                  <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                    {generateGridHTML()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}