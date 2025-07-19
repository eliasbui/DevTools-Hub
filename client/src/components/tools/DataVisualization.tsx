import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RefreshCw,
  Search,
  Copy,
  Code,
  FileImage,
  Eye,
  GitBranch,
  Minimize2,
  Network,
  TreePine,
  Shuffle,
  ChevronRight,
  ChevronDown,
  FileJson,
  FileText,
  Database,
  Braces,
  Box,
  Circle,
  Square,
  Hash,
  Type,
  ToggleLeft,
  X,
  Clipboard,
  FileCode,
  Table
} from 'lucide-react';
import * as d3 from 'd3';
import { saveAs } from 'file-saver';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as jsyaml from 'js-yaml';

interface TreeNode {
  id: string;
  name: string;
  value?: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  children?: TreeNode[];
  parent?: TreeNode | null;
  depth?: number;
  x?: number;
  y?: number;
  collapsed?: boolean;
  _collapsed?: boolean;
}

export function DataVisualization() {
  const [input, setInput] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'graph'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nodeCount, setNodeCount] = useState(0);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TreeNode | null>(null);
  const { toast } = useToast();
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Example JSON
  const exampleJson = {
    "name": "John Doe",
    "age": 30,
    "active": true,
    "skills": ["JavaScript", "React", "Node.js"],
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "country": "USA"
    },
    "projects": [
      {
        "name": "JsonCrack Clone",
        "status": "in-progress",
        "technologies": ["React", "D3.js"]
      }
    ]
  };

  // Detect data format
  const detectDataFormat = (data: string): 'json' | 'xml' | 'yaml' | 'csv' | 'unknown' => {
    const trimmed = data.trim();
    
    // JSON detection
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {}
    }
    
    // XML detection
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      return 'xml';
    }
    
    // CSV detection - check for comma-separated values with consistent columns
    const lines = trimmed.split('\n');
    if (lines.length > 1) {
      const firstLineCommas = (lines[0].match(/,/g) || []).length;
      if (firstLineCommas > 0 && lines.slice(1, 3).every(line => 
        (line.match(/,/g) || []).length === firstLineCommas)) {
        return 'csv';
      }
    }
    
    // YAML detection
    if (trimmed.includes(':') && (trimmed.includes('\n') || trimmed.includes('- '))) {
      try {
        jsyaml.load(trimmed);
        return 'yaml';
      } catch {}
    }
    
    return 'unknown';
  };

  // Parse XML to tree structure
  const xmlToTree = (xmlString: string): TreeNode | null => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      if (xmlDoc.querySelector('parsererror')) {
        throw new Error('Invalid XML');
      }
      
      const convertNode = (node: Element, name: string = 'root'): TreeNode => {
        const treeNode: TreeNode = {
          id: Math.random().toString(36).substr(2, 9),
          name: name,
          type: 'object',
          children: [],
          depth: 0,
          collapsed: false,
          _collapsed: false
        };
        
        // Add attributes as children
        if (node.attributes.length > 0) {
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            treeNode.children!.push({
              id: Math.random().toString(36).substr(2, 9),
              name: `@${attr.name}`,
              type: 'string',
              value: attr.value,
              children: [],
              depth: 1,
              collapsed: false,
              _collapsed: false
            });
          }
        }
        
        // Add text content if no child elements
        if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
          const text = node.textContent?.trim();
          if (text) {
            treeNode.type = 'string';
            treeNode.value = text;
            treeNode.children = undefined;
          }
        } else {
          // Add child elements
          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            treeNode.children!.push(convertNode(child, child.tagName));
          }
        }
        
        return treeNode;
      };
      
      return convertNode(xmlDoc.documentElement, xmlDoc.documentElement.tagName);
    } catch (error) {
      return null;
    }
  };

  // Parse CSV to tree structure
  const csvToTree = (csvString: string): TreeNode | null => {
    try {
      const lines = csvString.trim().split('\n');
      if (lines.length < 2) return null;
      
      const headers = lines[0].split(',').map(h => h.trim());
      const rows: TreeNode[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: TreeNode = {
          id: Math.random().toString(36).substr(2, 9),
          name: `Row ${i}`,
          type: 'object',
          children: [],
          depth: 1,
          collapsed: false,
          _collapsed: false
        };
        
        headers.forEach((header, index) => {
          if (values[index] !== undefined) {
            row.children!.push({
              id: Math.random().toString(36).substr(2, 9),
              name: header,
              type: 'string',
              value: values[index],
              children: [],
              depth: 2,
              collapsed: false,
              _collapsed: false
            });
          }
        });
        
        rows.push(row);
      }
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: 'CSV Data',
        type: 'array',
        children: rows,
        depth: 0,
        collapsed: false,
        _collapsed: false
      };
    } catch (error) {
      return null;
    }
  };

  // Parse YAML to tree structure  
  const yamlToTree = (yamlString: string): TreeNode | null => {
    try {
      const data = jsyaml.load(yamlString);
      return jsonToTree(data, 'root');
    } catch (error) {
      return null;
    }
  };

  // Convert JSON to tree structure
  const jsonToTree = (data: any, name: string = 'root', parent: TreeNode | null = null, depth: number = 0): TreeNode => {
    const id = Math.random().toString(36).substr(2, 9);
    const type = Array.isArray(data) ? 'array' : data === null ? 'null' : typeof data as any;
    
    const node: TreeNode = {
      id,
      name,
      type,
      parent,
      children: [],
      depth,
      collapsed: false,
      _collapsed: false
    };

    if (type === 'object' && data !== null) {
      node.children = Object.entries(data).map(([key, value]) => 
        jsonToTree(value, key, node, depth + 1)
      );
    } else if (type === 'array') {
      node.children = data.map((item: any, index: number) => 
        jsonToTree(item, `[${index}]`, node, depth + 1)
      );
    } else {
      node.value = data;
    }

    return node;
  };

  // Handle paste event
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const format = detectDataFormat(pastedData);
    
    // Format based on detected type
    if (format === 'json') {
      try {
        const parsed = JSON.parse(pastedData);
        setInput(JSON.stringify(parsed, null, 2));
      } catch {
        setInput(pastedData);
      }
    } else if (format === 'yaml') {
      // YAML is already human-readable, just set it
      setInput(pastedData);
    } else if (format === 'xml') {
      // Pretty-print XML
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(pastedData, 'text/xml');
        const serializer = new XMLSerializer();
        const formatted = serializer.serializeToString(xmlDoc);
        setInput(formatted);
      } catch {
        setInput(pastedData);
      }
    } else {
      // CSV or unknown, paste as-is
      setInput(pastedData);
    }
  }, []);

  // Parse input
  const parseInput = useCallback(() => {
    if (!input.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some data to visualize",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const format = detectDataFormat(input);
      let tree: TreeNode | null = null;
      
      switch (format) {
        case 'json':
          const jsonData = JSON.parse(input);
          tree = jsonToTree(jsonData);
          break;
          
        case 'xml':
          tree = xmlToTree(input);
          if (!tree) {
            throw new Error('Invalid XML format');
          }
          break;
          
        case 'yaml':
          tree = yamlToTree(input);
          if (!tree) {
            throw new Error('Invalid YAML format');
          }
          break;
          
        case 'csv':
          tree = csvToTree(input);
          if (!tree) {
            throw new Error('Invalid CSV format');
          }
          break;
          
        default:
          throw new Error('Unsupported data format. Please provide JSON, XML, YAML, or CSV data.');
      }
      
      if (tree) {
        setTreeData(tree);
        
        // Count nodes
        let count = 0;
        const countNodes = (node: TreeNode) => {
          count++;
          node.children?.forEach(countNodes);
        };
        countNodes(tree);
        setNodeCount(count);
        
        toast({
          title: "Success",
          description: `Visualized ${count} nodes from ${format.toUpperCase()} data`
        });
      }
    } catch (error: any) {
      toast({
        title: "Parse Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [input, toast]);

  // Get node color based on type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'object': return '#3b82f6'; // blue-500
      case 'array': return '#10b981'; // emerald-500
      case 'string': return '#f59e0b'; // amber-500
      case 'number': return '#8b5cf6'; // violet-500
      case 'boolean': return '#ef4444'; // red-500
      case 'null': return '#6b7280'; // gray-500
      default: return '#64748b'; // slate-500
    }
  };

  // Get icon for node type
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'object': return Braces;
      case 'array': return Square;
      case 'string': return Type;
      case 'number': return Hash;
      case 'boolean': return ToggleLeft;
      case 'null': return X;
      default: return Circle;
    }
  };

  // Toggle node collapse state
  const toggleNodeCollapse = useCallback((nodeId: string) => {
    if (!treeData) return;

    const updateNode = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, collapsed: !node.collapsed };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode)
        };
      }
      return node;
    };

    setTreeData(updateNode(treeData));
  }, [treeData]);

  // Render tree visualization
  useEffect(() => {
    if (!treeData || !svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    // Clear previous content
    g.selectAll("*").remove();

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    if (viewMode === 'tree') {
      // Tree layout
      const nodeWidth = 200;
      const nodeHeight = 80;
      const horizontalSpacing = 250;
      const verticalSpacing = 120;

      // Filter collapsed nodes
      const filterCollapsed = (node: d3.HierarchyNode<TreeNode>): boolean => {
        const data = node.data;
        if (data.collapsed) {
          node.children = undefined;
          return true;
        }
        if (node.children) {
          node.children = node.children.filter(filterCollapsed);
        }
        return true;
      };

      const root = d3.hierarchy(treeData);
      filterCollapsed(root);

      const treeLayout = d3.tree<TreeNode>()
        .nodeSize([verticalSpacing, horizontalSpacing])
        .separation((a, b) => 1);

      const treeRoot = treeLayout(root);

      // Center the tree
      const bounds = {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity
      };

      treeRoot.descendants().forEach(d => {
        bounds.minX = Math.min(bounds.minX, d.y);
        bounds.maxX = Math.max(bounds.maxX, d.y);
        bounds.minY = Math.min(bounds.minY, d.x);
        bounds.maxY = Math.max(bounds.maxY, d.x);
      });

      const centerX = width / 2 - (bounds.minX + bounds.maxX) / 2;
      const centerY = height / 2 - (bounds.minY + bounds.maxY) / 2;

      // Links with curved paths
      const linkGroup = g.append('g').attr('class', 'links');
      
      linkGroup.selectAll('.link')
        .data(treeRoot.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 2)
        .attr('d', d3.linkHorizontal<any, any>()
          .x(d => d.y + centerX)
          .y(d => d.x + centerY)
        );

      // Node groups
      const nodes = g.append('g')
        .attr('class', 'nodes')
        .selectAll('.node')
        .data(treeRoot.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y + centerX},${d.x + centerY})`)
        .style('cursor', 'pointer');

      // Node background rectangles
      nodes.append('rect')
        .attr('x', -nodeWidth / 2)
        .attr('y', -nodeHeight / 2)
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 8)
        .attr('fill', '#ffffff')
        .attr('stroke', d => getNodeColor((d.data as TreeNode).type))
        .attr('stroke-width', 2)
        .on('mouseenter', (event, d) => setHoveredNode(d.data as TreeNode))
        .on('mouseleave', () => setHoveredNode(null))
        .on('click', (event, d) => {
          event.stopPropagation();
          const node = d.data as TreeNode;
          if (node.children && node.children.length > 0) {
            toggleNodeCollapse(node.id);
          } else {
            setSelectedNode(node);
          }
        });

      // Add node type icon background
      nodes.append('rect')
        .attr('x', -nodeWidth / 2 + 10)
        .attr('y', -nodeHeight / 2 + 10)
        .attr('width', 30)
        .attr('height', 30)
        .attr('rx', 6)
        .attr('fill', d => getNodeColor((d.data as TreeNode).type))
        .attr('opacity', 0.1);

      // Add collapse/expand indicator for parent nodes
      nodes.filter(d => (d.data as TreeNode).children && (d.data as TreeNode).children!.length > 0)
        .append('circle')
        .attr('cx', nodeWidth / 2 - 15)
        .attr('cy', 0)
        .attr('r', 10)
        .attr('fill', '#f3f4f6')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);

      nodes.filter(d => (d.data as TreeNode).children && (d.data as TreeNode).children!.length > 0)
        .append('text')
        .attr('x', nodeWidth / 2 - 15)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#6b7280')
        .style('font-weight', 'bold')
        .text(d => (d.data as TreeNode).collapsed ? '+' : '−');

      // Node name
      nodes.append('text')
        .attr('x', -nodeWidth / 2 + 50)
        .attr('y', -5)
        .style('font-size', '14px')
        .style('font-weight', '600')
        .style('fill', '#1f2937')
        .text(d => (d.data as TreeNode).name)
        .each(function(d) {
          const text = d3.select(this);
          const textLength = text.node()?.getComputedTextLength() || 0;
          if (textLength > nodeWidth - 70) {
            text.text((d.data as TreeNode).name.substring(0, 20) + '...');
          }
        });

      // Node value or type
      nodes.append('text')
        .attr('x', -nodeWidth / 2 + 50)
        .attr('y', 15)
        .style('font-size', '12px')
        .style('fill', '#6b7280')
        .text(d => {
          const node = d.data as TreeNode;
          if (node.value !== undefined) {
            const str = JSON.stringify(node.value);
            return str.length > 30 ? str.substring(0, 30) + '...' : str;
          } else if (node.children) {
            return `${node.type} (${node.children.length} items)`;
          }
          return node.type;
        });
    } else {
      // Force-directed graph layout
      const simulation = d3.forceSimulation(treeData ? flattenTree(treeData) : [])
        .force('link', d3.forceLink<any, any>()
          .id(d => d.id)
          .distance(50))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));

      const links = getLinks(treeData);
      
      // Links
      const link = g.selectAll('.link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 2);

      // Nodes
      const node = g.selectAll('.node')
        .data(flattenTree(treeData))
        .enter()
        .append('g')
        .attr('class', 'node')
        .call(d3.drag<any, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      node.append('circle')
        .attr('r', 20)
        .attr('fill', d => getNodeColor(d.type))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer');

      node.append('text')
        .attr('dy', 4)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#fff')
        .text(d => d.name);

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });

      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }

    // Setup zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

  }, [treeData, viewMode, toast]);

  // Flatten tree for force layout
  const flattenTree = (node: TreeNode): any[] => {
    const nodes = [node];
    if (node.children) {
      node.children.forEach(child => {
        nodes.push(...flattenTree(child));
      });
    }
    return nodes;
  };

  // Get links for force layout
  const getLinks = (node: TreeNode): any[] => {
    const links: any[] = [];
    if (node.children) {
      node.children.forEach(child => {
        links.push({ source: node, target: child });
        links.push(...getLinks(child));
      });
    }
    return links;
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    if (!svgRef.current || !gRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const newZoom = Math.max(0.1, Math.min(4, zoomLevel + delta));
    
    svg.transition()
      .duration(300)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity.scale(newZoom)
      );
  };

  // Export as image
  const exportAsImage = (format: 'png' | 'svg') => {
    if (!svgRef.current) return;

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      saveAs(blob, 'data-visualization.svg');
    } else {
      // Convert SVG to PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const img = new Image();
      
      canvas.width = svgRef.current.clientWidth;
      canvas.height = svgRef.current.clientHeight;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) saveAs(blob, 'data-visualization.png');
        });
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  // Load example
  const loadExample = (type: 'json' | 'xml' | 'yaml' | 'csv' = 'json') => {
    switch (type) {
      case 'json':
        setInput(JSON.stringify(exampleJson, null, 2));
        break;
      case 'xml':
        setInput(`<?xml version="1.0" encoding="UTF-8"?>
<company>
  <name>Tech Corp</name>
  <employees>
    <employee id="1">
      <name>John Doe</name>
      <position>Developer</position>
      <skills>
        <skill>JavaScript</skill>
        <skill>React</skill>
      </skills>
    </employee>
    <employee id="2">
      <name>Jane Smith</name>
      <position>Designer</position>
      <skills>
        <skill>UI/UX</skill>
        <skill>Figma</skill>
      </skills>
    </employee>
  </employees>
</company>`);
        break;
      case 'yaml':
        setInput(`company:
  name: Tech Corp
  employees:
    - id: 1
      name: John Doe
      position: Developer
      skills:
        - JavaScript
        - React
    - id: 2
      name: Jane Smith
      position: Designer
      skills:
        - UI/UX
        - Figma`);
        break;
      case 'csv':
        setInput(`id,name,position,department,salary
1,John Doe,Developer,Engineering,95000
2,Jane Smith,Designer,Design,85000
3,Bob Johnson,Manager,Sales,105000
4,Alice Brown,Developer,Engineering,92000`);
        break;
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + V - Focus textarea for paste
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && document.activeElement !== textareaRef.current) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
      // Cmd/Ctrl + Enter - Visualize
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        parseInput();
      }
      // Escape - Clear selection
      if (e.key === 'Escape') {
        setSelectedNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [parseInput]);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Data Visualizer (JSON/XML/YAML/CSV)
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => loadExample('json')} title="Load JSON Example">
                <FileJson className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadExample('xml')} title="Load XML Example">
                <FileCode className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadExample('yaml')} title="Load YAML Example">
                <FileText className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadExample('csv')} title="Load CSV Example">
                <Table className="w-4 h-4" />
              </Button>
            </div>
            <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tree">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-4 h-4" />
                    Tree View
                  </div>
                </SelectItem>
                <SelectItem value="graph">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4" />
                    Graph View
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex h-[calc(100%-5rem)] gap-4">
        {/* Left Panel - Input */}
        <div className="w-1/3 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Input Data</label>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              placeholder="Paste your JSON, XML, YAML, or CSV data here..."
              className="h-[400px] font-mono text-sm resize-none"
              spellCheck={false}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={parseInput} 
              disabled={isProcessing}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              Visualize
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInput('');
                setTreeData(null);
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {nodeCount > 0 && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="text-sm">
                <span className="font-medium">Nodes:</span> {nodeCount}
              </div>
              <div className="text-sm">
                <span className="font-medium">View:</span> {viewMode}
              </div>
              <div className="text-sm">
                <span className="font-medium">Zoom:</span> {Math.round(zoomLevel * 100)}%
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Node Types</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { type: 'object', label: 'Object', color: '#3b82f6' },
                { type: 'array', label: 'Array', color: '#10b981' },
                { type: 'string', label: 'String', color: '#f59e0b' },
                { type: 'number', label: 'Number', color: '#8b5cf6' },
                { type: 'boolean', label: 'Boolean', color: '#ef4444' },
                { type: 'null', label: 'Null', color: '#6b7280' }
              ].map(({ type, label, color }) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <div className="p-3 border rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Selected Node</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNode(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs space-y-1">
                <div><span className="font-medium">Key:</span> {selectedNode.name}</div>
                <div><span className="font-medium">Type:</span> {selectedNode.type}</div>
                {selectedNode.value !== undefined && (
                  <div>
                    <span className="font-medium">Value:</span>
                    <div className="mt-1 p-2 bg-muted rounded font-mono text-xs break-all">
                      {JSON.stringify(selectedNode.value, null, 2)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedNode.value));
                        toast({
                          title: "Copied",
                          description: "Value copied to clipboard"
                        });
                      }}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Value
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Visualization */}
        <div className="flex-1 relative border rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom(0.2)}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom(-0.2)}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            <Select onValueChange={(format: any) => exportAsImage(format)}>
              <SelectTrigger className="w-24">
                <Download className="w-4 h-4 mr-1" />
                Export
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div ref={containerRef} className="w-full h-full">
            <svg ref={svgRef} width="100%" height="100%">
              <g ref={gRef} />
            </svg>
          </div>

          {!treeData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <GitBranch className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">No Data to Visualize</h3>
                  <p className="text-sm text-muted-foreground">
                    Paste your data and click "Visualize" to see the graph
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}