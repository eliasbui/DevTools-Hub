import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Database, Table, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TableSchema {
  name: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    primary: boolean;
    foreign?: {
      table: string;
      column: string;
    };
  }[];
}

interface Relationship {
  from: { table: string; column: string };
  to: { table: string; column: string };
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export function DatabaseSchemaVisualizer() {
  const [sqlInput, setSqlInput] = useState('');
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState('');

  const parseSQLSchema = (sql: string) => {
    try {
      setError('');
      const tables: TableSchema[] = [];
      const relationships: Relationship[] = [];

      // Remove comments
      const cleanSQL = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

      // Extract CREATE TABLE statements
      const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\(([\s\S]*?)\);/gi;
      let match;

      while ((match = tableRegex.exec(cleanSQL)) !== null) {
        const tableName = match[1];
        const columnsText = match[2];
        const columns: TableSchema['columns'] = [];

        // Parse columns
        const columnLines = columnsText.split(',').map(line => line.trim());
        
        for (const line of columnLines) {
          if (!line || line.startsWith('PRIMARY KEY') || line.startsWith('FOREIGN KEY') || line.startsWith('KEY') || line.startsWith('INDEX')) {
            continue;
          }

          const columnMatch = line.match(/`?(\w+)`?\s+(\w+(?:\([^)]+\))?(?:\s+\w+)*)/);
          if (columnMatch) {
            const columnName = columnMatch[1];
            const columnType = columnMatch[2];
            const isNullable = !line.toUpperCase().includes('NOT NULL');
            const isPrimary = line.toUpperCase().includes('PRIMARY KEY');

            columns.push({
              name: columnName,
              type: columnType.toUpperCase(),
              nullable: isNullable,
              primary: isPrimary,
            });
          }
        }

        // Check for primary keys defined separately
        const pkMatch = columnsText.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
        if (pkMatch) {
          const pkColumns = pkMatch[1].split(',').map(col => col.trim().replace(/`/g, ''));
          columns.forEach(col => {
            if (pkColumns.includes(col.name)) {
              col.primary = true;
            }
          });
        }

        // Check for foreign keys
        const fkRegex = /FOREIGN\s+KEY\s*\(`?(\w+)`?\)\s+REFERENCES\s+`?(\w+)`?\s*\(`?(\w+)`?\)/gi;
        let fkMatch;
        while ((fkMatch = fkRegex.exec(columnsText)) !== null) {
          const fromColumn = fkMatch[1];
          const toTable = fkMatch[2];
          const toColumn = fkMatch[3];

          // Update column with foreign key info
          const column = columns.find(col => col.name === fromColumn);
          if (column) {
            column.foreign = { table: toTable, column: toColumn };
          }

          // Add relationship
          relationships.push({
            from: { table: tableName, column: fromColumn },
            to: { table: toTable, column: toColumn },
            type: 'one-to-many' // Default assumption
          });
        }

        tables.push({ name: tableName, columns });
      }

      setTables(tables);
      setRelationships(relationships);
      generateERD(tables, relationships);
    } catch (err) {
      setError('Failed to parse SQL schema. Please check your input.');
    }
  };

  const generateERD = (tables: TableSchema[], relationships: Relationship[]) => {
    const width = 1200;
    const height = 800;
    const tableWidth = 200;
    const tableHeaderHeight = 30;
    const columnHeight = 25;
    const padding = 20;

    // Simple grid layout
    const cols = Math.ceil(Math.sqrt(tables.length));
    const tablePositions: { [key: string]: { x: number; y: number; height: number } } = {};

    tables.forEach((table, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = padding + col * (tableWidth + 100);
      const y = padding + row * 250;
      const height = tableHeaderHeight + table.columns.length * columnHeight + 10;
      
      tablePositions[table.name] = { x, y, height };
    });

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += '<defs>';
    svg += '<marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">';
    svg += '<polygon points="0 0, 10 3, 0 6" fill="#666" />';
    svg += '</marker>';
    svg += '</defs>';

    // Draw relationships first (behind tables)
    relationships.forEach(rel => {
      const fromTable = tablePositions[rel.from.table];
      const toTable = tablePositions[rel.to.table];
      
      if (fromTable && toTable) {
        const fromY = fromTable.y + tableHeaderHeight + 
          tables.find(t => t.name === rel.from.table)!.columns.findIndex(c => c.name === rel.from.column) * columnHeight + columnHeight / 2;
        const toY = toTable.y + tableHeaderHeight + 
          tables.find(t => t.name === rel.to.table)!.columns.findIndex(c => c.name === rel.to.column) * columnHeight + columnHeight / 2;

        const fromX = fromTable.x + tableWidth;
        const toX = toTable.x;

        // Simple curved path
        const midX = (fromX + toX) / 2;
        svg += `<path d="M ${fromX} ${fromY} Q ${midX} ${fromY} ${midX} ${(fromY + toY) / 2} T ${toX} ${toY}" stroke="#666" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />`;
      }
    });

    // Draw tables
    tables.forEach(table => {
      const pos = tablePositions[table.name];
      
      // Table container
      svg += `<g transform="translate(${pos.x}, ${pos.y})">`;
      
      // Table background
      svg += `<rect width="${tableWidth}" height="${pos.height}" fill="white" stroke="#333" stroke-width="2" rx="5" />`;
      
      // Table header
      svg += `<rect width="${tableWidth}" height="${tableHeaderHeight}" fill="#4a5568" rx="5" />`;
      svg += `<text x="${tableWidth / 2}" y="${tableHeaderHeight / 2 + 5}" text-anchor="middle" fill="white" font-weight="bold" font-family="Arial, sans-serif">${table.name}</text>`;
      
      // Columns
      table.columns.forEach((column, index) => {
        const y = tableHeaderHeight + index * columnHeight;
        
        // Column separator
        if (index > 0) {
          svg += `<line x1="0" y1="${y}" x2="${tableWidth}" y2="${y}" stroke="#e2e8f0" />`;
        }
        
        // Column text
        let columnText = column.name;
        if (column.primary) columnText = '🔑 ' + columnText;
        if (column.foreign) columnText = '🔗 ' + columnText;
        
        svg += `<text x="10" y="${y + columnHeight / 2 + 4}" fill="#333" font-size="12" font-family="Arial, sans-serif">${columnText}</text>`;
        svg += `<text x="${tableWidth - 10}" y="${y + columnHeight / 2 + 4}" text-anchor="end" fill="#666" font-size="10" font-family="Arial, sans-serif">${column.type}</text>`;
      });
      
      svg += '</g>';
    });

    svg += '</svg>';
    setSvgContent(svg);
  };

  const downloadSVG = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database-schema.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sampleSchema = `CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);`;

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
              <Database className="w-5 h-5" />
            </motion.div>
            <span>Database Schema Visualizer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sample Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSqlInput(sampleSchema)}
            className="animate-pulse-hover"
          >
            Load Sample Schema
          </Button>

          {/* SQL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">SQL Schema (CREATE TABLE statements)</label>
            <Textarea
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="Paste your CREATE TABLE statements here..."
              className="min-h-[200px] font-mono text-sm smooth-transition focus:scale-105"
            />
          </div>

          {/* Generate Button */}
          <Button 
            onClick={() => parseSQLSchema(sqlInput)} 
            className="w-full animate-pulse-hover"
            disabled={!sqlInput.trim()}
          >
            Generate ERD
          </Button>

          {/* Error Message */}
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

          {/* ERD Display */}
          <AnimatePresence>
            {svgContent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                {/* Tables Summary */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Table className="w-4 h-4" />
                      {tables.length} Tables
                    </span>
                    <span>
                      {relationships.length} Relationships
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadSVG}
                    className="animate-pulse-hover"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download SVG
                  </Button>
                </div>

                {/* ERD Visualization */}
                <div className="border rounded-lg p-4 bg-muted/50 overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: svgContent }} />
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>🔑 Primary Key</span>
                  <span>🔗 Foreign Key</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}