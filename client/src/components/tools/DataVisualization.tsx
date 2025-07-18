import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RefreshCw,
  Search,
  Copy,
  Share2,
  Code,
  FileImage,
  FileJson,
  Eye
} from 'lucide-react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import fcose from 'cytoscape-fcose';

// Register layouts
cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(fcose);

interface DetectedFormat {
  format: 'json' | 'xml' | 'yaml' | 'csv' | 'text' | 'unknown';
  confidence: number;
  error?: string;
}

export function DataVisualization() {
  const [input, setInput] = useState('');
  const [detectedFormat, setDetectedFormat] = useState<DetectedFormat>({ format: 'unknown', confidence: 0 });
  const [selectedLayout, setSelectedLayout] = useState('fcose');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [graphData, setGraphData] = useState<any>(null);
  const { toast } = useToast();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Auto-detect format
  const detectFormat = useCallback((content: string): DetectedFormat => {
    const trimmed = content.trim();
    
    if (!trimmed) {
      return { format: 'unknown', confidence: 0 };
    }

    // JSON detection
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return { format: 'json', confidence: 100 };
      } catch (e) {
        // Check if it's likely JSON with syntax errors
        if (trimmed.includes('"') && (trimmed.includes(':') || trimmed.includes(','))) {
          return { format: 'json', confidence: 60, error: 'Invalid JSON syntax' };
        }
      }
    }

    // XML detection
    if (trimmed.includes('<?xml') || (trimmed.startsWith('<') && trimmed.endsWith('>'))) {
      const xmlPattern = /<[^>]+>/g;
      const matches = trimmed.match(xmlPattern);
      if (matches && matches.length > 2) {
        return { format: 'xml', confidence: 90 };
      }
    }

    // YAML detection
    if ((trimmed.includes('---') || trimmed.includes(':')) && 
        !trimmed.includes('{') && 
        /^\s*\w+:/m.test(trimmed)) {
      return { format: 'yaml', confidence: 80 };
    }

    // CSV detection
    const lines = trimmed.split('\n');
    if (lines.length > 1) {
      const firstLineCommas = (lines[0].match(/,/g) || []).length;
      if (firstLineCommas > 0) {
        const allLinesHaveCommas = lines.slice(0, Math.min(5, lines.length))
          .every(line => (line.match(/,/g) || []).length === firstLineCommas);
        if (allLinesHaveCommas) {
          return { format: 'csv', confidence: 85 };
        }
      }
    }

    return { format: 'text', confidence: 50 };
  }, []);

  // Convert data to graph format
  const dataToGraph = useCallback((data: any, format: string) => {
    const nodes: any[] = [];
    const edges: any[] = [];
    let nodeId = 0;

    const addNode = (id: string, label: string, type: string, value?: any) => {
      nodes.push({
        data: { 
          id, 
          label: label.length > 30 ? label.substring(0, 30) + '...' : label, 
          type,
          fullLabel: label,
          value: value
        }
      });
    };

    const addEdge = (source: string, target: string, label?: string) => {
      edges.push({
        data: { 
          id: `e${edges.length}`, 
          source, 
          target, 
          label: label || ''
        }
      });
    };

    const processObject = (obj: any, parentId?: string, key?: string) => {
      const currentId = `n${nodeId++}`;
      
      if (obj === null || obj === undefined) {
        addNode(currentId, key || 'null', 'null', null);
      } else if (Array.isArray(obj)) {
        addNode(currentId, key || 'Array', 'array', `[${obj.length}]`);
        obj.forEach((item, index) => {
          const childId = processObject(item, currentId, `[${index}]`);
          addEdge(currentId, childId);
        });
      } else if (typeof obj === 'object') {
        addNode(currentId, key || 'Object', 'object', `{${Object.keys(obj).length}}`);
        Object.entries(obj).forEach(([k, v]) => {
          const childId = processObject(v, currentId, k);
          addEdge(currentId, childId, k);
        });
      } else {
        const valueStr = String(obj);
        addNode(currentId, key || valueStr, typeof obj, valueStr);
      }
      
      if (parentId) {
        return currentId;
      }
      
      return currentId;
    };

    try {
      if (format === 'json') {
        const parsed = JSON.parse(data);
        processObject(parsed);
      } else if (format === 'csv') {
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const rootId = `n${nodeId++}`;
        addNode(rootId, 'CSV Data', 'root', `${lines.length - 1} rows`);
        
        lines.slice(1).forEach((line, rowIndex) => {
          const rowId = `n${nodeId++}`;
          addNode(rowId, `Row ${rowIndex + 1}`, 'row');
          addEdge(rootId, rowId);
          
          const values = line.split(',').map(v => v.trim());
          headers.forEach((header, colIndex) => {
            const cellId = `n${nodeId++}`;
            addNode(cellId, values[colIndex] || '', 'value', values[colIndex]);
            addEdge(rowId, cellId, header);
          });
        });
      } else {
        // For other formats, create a simple text node
        const rootId = `n${nodeId++}`;
        addNode(rootId, 'Text Data', 'text', data);
      }
      
      return { nodes, edges };
    } catch (error) {
      throw new Error(`Failed to parse ${format} data: ${error.message}`);
    }
  }, []);

  // Initialize Cytoscape
  const initializeCytoscape = useCallback((elements: any) => {
    if (!containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: any) => {
              const type = ele.data('type');
              switch (type) {
                case 'object': return '#0079F2';
                case 'array': return '#10B981';
                case 'string': return '#F59E0B';
                case 'number': return '#8B5CF6';
                case 'boolean': return '#EF4444';
                case 'null': return '#6B7280';
                default: return '#64748B';
              }
            },
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'color': '#fff',
            'text-outline-width': 2,
            'text-outline-color': (ele: any) => {
              const type = ele.data('type');
              switch (type) {
                case 'object': return '#0079F2';
                case 'array': return '#10B981';
                case 'string': return '#F59E0B';
                case 'number': return '#8B5CF6';
                case 'boolean': return '#EF4444';
                case 'null': return '#6B7280';
                default: return '#64748B';
              }
            },
            'width': 40,
            'height': 40
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94A3B8',
            'target-arrow-color': '#94A3B8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': -10
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': 3,
            'border-color': '#0079F2'
          }
        }
      ],
      layout: {
        name: selectedLayout,
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 50
      }
    });

    // Add event listeners
    cyRef.current.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      const data = node.data();
      toast({
        title: data.fullLabel || data.label,
        description: `Type: ${data.type}, Value: ${data.value || 'N/A'}`
      });
    });

  }, [selectedLayout, toast]);

  // Process input data
  const processData = useCallback(() => {
    if (!input.trim()) {
      toast({
        title: "No input",
        description: "Please enter some data to visualize",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const format = detectedFormat.format;
      if (format === 'unknown' || format === 'text') {
        toast({
          title: "Unsupported format",
          description: "Please enter valid JSON, XML, YAML, or CSV data",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      const graphData = dataToGraph(input, format);
      setGraphData(graphData);
      
      const elements = [...graphData.nodes, ...graphData.edges];
      initializeCytoscape(elements);
      
    } catch (error) {
      toast({
        title: "Processing error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [input, detectedFormat, dataToGraph, initializeCytoscape, toast]);

  // Layout change
  const changeLayout = (layout: string) => {
    setSelectedLayout(layout);
    if (cyRef.current) {
      cyRef.current.layout({ 
        name: layout, 
        animate: true, 
        animationDuration: 1000,
        fit: true,
        padding: 50
      }).run();
    }
  };

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out' | 'fit') => {
    if (!cyRef.current) return;
    
    if (direction === 'in') {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    } else if (direction === 'out') {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    } else {
      cyRef.current.fit();
    }
  };

  // Search functionality
  const handleSearch = () => {
    if (!cyRef.current || !searchQuery) return;

    cyRef.current.elements().removeClass('highlighted');
    
    if (searchQuery) {
      cyRef.current.nodes().forEach((node: any) => {
        const label = node.data('fullLabel') || node.data('label');
        if (label.toLowerCase().includes(searchQuery.toLowerCase())) {
          node.addClass('highlighted');
        }
      });
    }
  };

  // Export functionality
  const exportGraph = (format: 'png' | 'json' | 'svg') => {
    if (!cyRef.current) return;

    if (format === 'png') {
      const png = cyRef.current.png({ 
        output: 'blob',
        bg: 'white',
        scale: 2
      });
      
      const url = URL.createObjectURL(png);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graph-visualization.png';
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const json = JSON.stringify(graphData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graph-data.json';
      a.click();
      URL.revokeObjectURL(url);
    }
    
    toast({
      title: "Export successful",
      description: `Graph exported as ${format.toUpperCase()}`
    });
  };

  // Update detected format when input changes
  useEffect(() => {
    const format = detectFormat(input);
    setDetectedFormat(format);
  }, [input, detectFormat]);

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data Input</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm px-2 py-1 rounded ${
                detectedFormat.confidence > 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                detectedFormat.confidence > 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                {detectedFormat.format.toUpperCase()} {detectedFormat.confidence}%
              </span>
              {detectedFormat.error && (
                <span className="text-sm text-red-500">{detectedFormat.error}</span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your JSON, XML, YAML, or CSV data here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button 
              onClick={processData} 
              disabled={isProcessing || detectedFormat.format === 'unknown'}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualize Data
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInput('');
                setGraphData(null);
                if (cyRef.current) {
                  cyRef.current.destroy();
                  cyRef.current = null;
                }
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Section */}
      {graphData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Interactive Graph</span>
              <div className="flex items-center gap-2">
                {/* Layout Selector */}
                <Select value={selectedLayout} onValueChange={changeLayout}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fcose">Force</SelectItem>
                    <SelectItem value="dagre">Tree</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="breadthfirst">Breadth First</SelectItem>
                    <SelectItem value="cola">Cola</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="flex items-center gap-1">
                  <Input
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-32"
                  />
                  <Button size="sm" variant="outline" onClick={handleSearch}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleZoom('in')}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleZoom('out')}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleZoom('fit')}>
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>

                {/* Export Options */}
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => exportGraph('png')}>
                    <FileImage className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportGraph('json')}>
                    <FileJson className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={containerRef} 
              className="w-full h-[600px] border rounded-lg bg-gray-50 dark:bg-gray-900"
              style={{ position: 'relative' }}
            />
            
            {/* Legend */}
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="font-semibold mb-2">Node Types</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#0079F2] rounded"></div>
                  <span>Object</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#10B981] rounded"></div>
                  <span>Array</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#F59E0B] rounded"></div>
                  <span>String</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#8B5CF6] rounded"></div>
                  <span>Number</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#EF4444] rounded"></div>
                  <span>Boolean</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#6B7280] rounded"></div>
                  <span>Null</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>The tool automatically detects JSON, XML, YAML, and CSV formats</li>
            <li>Click on nodes to see detailed information</li>
            <li>Drag nodes to reposition them manually</li>
            <li>Use the layout selector to change graph arrangement</li>
            <li>Search for specific nodes using the search bar</li>
            <li>Export your visualization as PNG or JSON</li>
            <li>Mouse wheel to zoom, drag to pan the view</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}