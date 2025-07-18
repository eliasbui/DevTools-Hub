import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

export function SQLFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState('standard');
  const [indentSize, setIndentSize] = useState('2');
  const [uppercase, setUppercase] = useState('true');
  const [error, setError] = useState('');

  const formatSQL = () => {
    setError('');
    setOutput('');

    if (!input.trim()) {
      setError('Please enter SQL to format');
      return;
    }

    try {
      // Simple SQL formatter implementation
      let formatted = input
        .replace(/\s+/g, ' ')
        .trim();

      // Keywords to uppercase or lowercase
      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
        'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS',
        'NULL', 'ORDER', 'BY', 'GROUP', 'HAVING', 'UNION', 'ALL', 'DISTINCT',
        'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
        'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'PRIMARY', 'KEY', 'FOREIGN',
        'REFERENCES', 'INDEX', 'VIEW', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE',
        'END', 'LIMIT', 'OFFSET', 'ASC', 'DESC', 'COUNT', 'SUM', 'AVG', 'MAX',
        'MIN', 'CAST', 'CONVERT', 'COALESCE', 'NULLIF', 'WITH', 'RECURSIVE'
      ];

      // Replace keywords with proper case
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, uppercase === 'true' ? keyword : keyword.toLowerCase());
      });

      // Add line breaks and indentation
      const indent = ' '.repeat(parseInt(indentSize));
      let level = 0;
      let inParentheses = 0;
      let result = '';
      let i = 0;

      while (i < formatted.length) {
        const char = formatted[i];
        const nextChars = formatted.substring(i, i + 10).toUpperCase();

        // Handle parentheses
        if (char === '(') {
          inParentheses++;
          result += char;
          if (formatted[i + 1] !== ')') {
            result += '\n' + indent.repeat(level + 1);
          }
        } else if (char === ')') {
          inParentheses--;
          if (formatted[i - 1] !== '(') {
            result += '\n' + indent.repeat(level);
          }
          result += char;
        }
        // Handle main SQL clauses
        else if (inParentheses === 0) {
          if (nextChars.startsWith('SELECT') && i > 0) {
            result += '\n' + indent.repeat(level) + 'SELECT';
            i += 5;
          } else if (nextChars.startsWith('FROM')) {
            result += '\n' + indent.repeat(level) + 'FROM';
            i += 3;
          } else if (nextChars.startsWith('WHERE')) {
            result += '\n' + indent.repeat(level) + 'WHERE';
            i += 4;
          } else if (nextChars.startsWith('JOIN') || nextChars.startsWith('LEFT') || 
                     nextChars.startsWith('RIGHT') || nextChars.startsWith('INNER')) {
            result += '\n' + indent.repeat(level);
            result += char;
          } else if (nextChars.startsWith('ORDER BY')) {
            result += '\n' + indent.repeat(level) + 'ORDER BY';
            i += 7;
          } else if (nextChars.startsWith('GROUP BY')) {
            result += '\n' + indent.repeat(level) + 'GROUP BY';
            i += 7;
          } else if (nextChars.startsWith('HAVING')) {
            result += '\n' + indent.repeat(level) + 'HAVING';
            i += 5;
          } else if (nextChars.startsWith('UNION')) {
            result += '\n' + indent.repeat(level) + 'UNION';
            i += 4;
          } else if (char === ',' && inParentheses === 0) {
            result += ',\n' + indent.repeat(level + 1);
          } else if (nextChars.startsWith('AND ') && !result.endsWith('\n' + indent.repeat(level + 1))) {
            result += '\n' + indent.repeat(level + 1) + 'AND';
            i += 2;
          } else if (nextChars.startsWith('OR ') && !result.endsWith('\n' + indent.repeat(level + 1))) {
            result += '\n' + indent.repeat(level + 1) + 'OR';
            i += 1;
          } else {
            result += char;
          }
        } else {
          result += char;
        }
        
        i++;
      }

      // Clean up extra spaces and empty lines
      result = result
        .split('\n')
        .map(line => line.trimEnd())
        .filter((line, index, arr) => !(line === '' && arr[index - 1] === ''))
        .join('\n');

      // Add semicolon if missing
      if (!result.trim().endsWith(';')) {
        result += ';';
      }

      setOutput(result);
    } catch (err: any) {
      setError('Failed to format SQL: ' + (err.message || 'Unknown error'));
    }
  };

  const minifySQL = () => {
    setError('');
    const minified = input
      .replace(/\s+/g, ' ')
      .replace(/\s*([(),;])\s*/g, '$1')
      .trim();
    setOutput(minified);
  };

  const sampleQueries = {
    simple: `select u.id, u.name, u.email, p.title, p.created_at
from users u left join posts p on u.id = p.user_id
where u.created_at > '2023-01-01' and u.status = 'active'
order by u.created_at desc, p.created_at desc
limit 10`,
    complex: `WITH user_stats AS (
  SELECT u.id, u.name, COUNT(p.id) as post_count,
    AVG(p.views) as avg_views
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  WHERE u.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
  GROUP BY u.id, u.name
  HAVING COUNT(p.id) > 5
)
SELECT us.*, 
  CASE 
    WHEN us.post_count > 20 THEN 'Power User'
    WHEN us.post_count > 10 THEN 'Active User'
    ELSE 'Regular User'
  END as user_type
FROM user_stats us
WHERE us.avg_views > 100
ORDER BY us.post_count DESC`,
    insert: `insert into users (name, email, password_hash, created_at, status)
values ('John Doe', 'john@example.com', 'hashed_password_here', now(), 'active'),
('Jane Smith', 'jane@example.com', 'another_hash', now(), 'pending')`,
    create: `create table if not exists posts (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  title varchar(255) not null,
  content text,
  views integer default 0,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp,
  index idx_user_id (user_id),
  index idx_created_at (created_at)
)`
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
              <Database className="w-5 h-5" />
            </motion.div>
            <span>SQL Formatter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Settings */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Dialect:</label>
              <Select value={dialect} onValueChange={setDialect}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard SQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Indent:</label>
              <Select value={indentSize} onValueChange={setIndentSize}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="8">Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Keywords:</label>
              <Select value={uppercase} onValueChange={setUppercase}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">UPPERCASE</SelectItem>
                  <SelectItem value="false">lowercase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sample Queries */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Load sample:</span>
            {Object.entries(sampleQueries).map(([key, query]) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                onClick={() => setInput(query)}
                className="animate-pulse-hover"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>

          {/* Input/Output Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input SQL</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your SQL query here..."
                className="min-h-[400px] font-mono text-sm smooth-transition focus:scale-105"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Formatted SQL</label>
                <AnimatePresence>
                  {output && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <CopyButton text={output} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder="Formatted SQL will appear here..."
                className="min-h-[400px] font-mono text-sm bg-muted"
              />
            </div>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={formatSQL} 
              className="flex-1 animate-pulse-hover"
              disabled={!input.trim()}
            >
              Format SQL
            </Button>
            <Button 
              onClick={minifySQL}
              variant="outline"
              className="animate-pulse-hover"
              disabled={!input.trim()}
            >
              Minify
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}