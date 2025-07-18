import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Plus, X, Download, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/common/CopyButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type DataType = 'name' | 'email' | 'phone' | 'address' | 'date' | 'number' | 'boolean' | 'uuid' | 'text' | 'choice';
type OutputFormat = 'json' | 'csv' | 'sql';

interface Field {
  name: string;
  type: DataType;
  options?: {
    min?: number;
    max?: number;
    choices?: string[];
    format?: string;
    words?: number;
  };
}

const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Emma', 'David', 'Sophie', 'Michael', 'Olivia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'example.com'];
const streets = ['Main St', 'Oak Ave', 'Park Rd', 'Elm St', 'First Ave', 'Second St', 'Maple Dr', 'Cedar Blvd'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA'];
const loremWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do'];

export function MockDataGenerator() {
  const [tableName, setTableName] = useState('users');
  const [rowCount, setRowCount] = useState('10');
  const [fields, setFields] = useState<Field[]>([
    { name: 'id', type: 'number', options: { min: 1, max: 1000 } },
    { name: 'name', type: 'name' },
    { name: 'email', type: 'email' },
  ]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('json');
  const [generatedData, setGeneratedData] = useState('');

  const addField = () => {
    setFields([...fields, { name: '', type: 'text' }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const generateRandomValue = (field: Field): any => {
    const { type, options = {} } = field;

    switch (type) {
      case 'name':
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        return `${firstName} ${lastName}`;

      case 'email':
        const firstName2 = firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase();
        const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase();
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `${firstName2}.${lastName2}@${domain}`;

      case 'phone':
        const areaCode = Math.floor(Math.random() * 900) + 100;
        const prefix = Math.floor(Math.random() * 900) + 100;
        const lineNumber = Math.floor(Math.random() * 9000) + 1000;
        return `(${areaCode}) ${prefix}-${lineNumber}`;

      case 'address':
        const streetNumber = Math.floor(Math.random() * 9999) + 1;
        const street = streets[Math.floor(Math.random() * streets.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const state = states[Math.floor(Math.random() * states.length)];
        const zip = Math.floor(Math.random() * 90000) + 10000;
        return `${streetNumber} ${street}, ${city}, ${state} ${zip}`;

      case 'date':
        const start = new Date(2020, 0, 1);
        const end = new Date();
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        if (options.format === 'timestamp') {
          return date.getTime();
        }
        return date.toISOString().split('T')[0];

      case 'number':
        const min = options.min || 0;
        const max = options.max || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;

      case 'boolean':
        return Math.random() < 0.5;

      case 'uuid':
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });

      case 'text':
        const wordCount = options.words || 10;
        const words = [];
        for (let i = 0; i < wordCount; i++) {
          words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
        }
        return words.join(' ');

      case 'choice':
        const choices = options.choices || ['option1', 'option2'];
        return choices[Math.floor(Math.random() * choices.length)];

      default:
        return 'N/A';
    }
  };

  const generateData = () => {
    const count = parseInt(rowCount) || 10;
    const rows = [];

    for (let i = 0; i < count; i++) {
      const row: any = {};
      fields.forEach(field => {
        if (field.name) {
          row[field.name] = generateRandomValue(field);
        }
      });
      rows.push(row);
    }

    let output = '';

    switch (outputFormat) {
      case 'json':
        output = JSON.stringify(rows, null, 2);
        break;

      case 'csv':
        const headers = fields.filter(f => f.name).map(f => f.name);
        const csvRows = [headers.join(',')];
        rows.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            // Escape values containing commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvRows.push(values.join(','));
        });
        output = csvRows.join('\n');
        break;

      case 'sql':
        const validFields = fields.filter(f => f.name);
        const columns = validFields.map(f => f.name).join(', ');
        const sqlRows = rows.map(row => {
          const values = validFields.map(field => {
            const value = row[field.name];
            if (value === null || value === undefined) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
            return value;
          });
          return `(${values.join(', ')})`;
        });
        output = `INSERT INTO ${tableName} (${columns})\nVALUES\n${sqlRows.join(',\n')};`;
        break;
    }

    setGeneratedData(output);
  };

  const downloadData = () => {
    const fileExtension = outputFormat === 'sql' ? 'sql' : outputFormat;
    const mimeType = outputFormat === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([generatedData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock-data.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setTableName('products');
    setRowCount('20');
    setFields([
      { name: 'id', type: 'number', options: { min: 1, max: 1000 } },
      { name: 'product_name', type: 'choice', options: { choices: ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse'] } },
      { name: 'price', type: 'number', options: { min: 99, max: 2999 } },
      { name: 'in_stock', type: 'boolean' },
      { name: 'category', type: 'choice', options: { choices: ['Electronics', 'Computers', 'Accessories'] } },
      { name: 'created_at', type: 'date' },
    ]);
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
            <span>Mock Data Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Table Name (for SQL)</label>
              <Input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="users"
              />
            </div>
            <div className="w-32 space-y-2">
              <label className="text-sm font-medium">Row Count</label>
              <Input
                type="number"
                value={rowCount}
                onChange={(e) => setRowCount(e.target.value)}
                placeholder="10"
                min="1"
                max="1000"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadExample}
              className="self-end animate-pulse-hover"
            >
              Load Example
            </Button>
          </div>

          {/* Fields */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Fields</label>
              <Button size="sm" variant="outline" onClick={addField} className="animate-pulse-hover">
                <Plus className="w-4 h-4 mr-1" />
                Add Field
              </Button>
            </div>
            
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex gap-2 p-3 bg-muted rounded-lg"
                >
                  <Input
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    placeholder="Field name"
                    className="w-40"
                  />
                  <Select 
                    value={field.type} 
                    onValueChange={(value: DataType) => updateField(index, { type: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="address">Address</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="uuid">UUID</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="choice">Choice</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Type-specific options */}
                  {field.type === 'number' && (
                    <>
                      <Input
                        type="number"
                        value={field.options?.min || 0}
                        onChange={(e) => updateField(index, { 
                          options: { ...field.options, min: parseInt(e.target.value) } 
                        })}
                        placeholder="Min"
                        className="w-20"
                      />
                      <Input
                        type="number"
                        value={field.options?.max || 100}
                        onChange={(e) => updateField(index, { 
                          options: { ...field.options, max: parseInt(e.target.value) } 
                        })}
                        placeholder="Max"
                        className="w-20"
                      />
                    </>
                  )}

                  {field.type === 'text' && (
                    <Input
                      type="number"
                      value={field.options?.words || 10}
                      onChange={(e) => updateField(index, { 
                        options: { ...field.options, words: parseInt(e.target.value) } 
                      })}
                      placeholder="Words"
                      className="w-20"
                    />
                  )}

                  {field.type === 'choice' && (
                    <Input
                      value={field.options?.choices?.join(', ') || ''}
                      onChange={(e) => updateField(index, { 
                        options: { ...field.options, choices: e.target.value.split(',').map(s => s.trim()) } 
                      })}
                      placeholder="option1, option2, ..."
                      className="flex-1"
                    />
                  )}

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeField(index)}
                    disabled={fields.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Output Format</label>
            <Tabs value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="csv">CSV</TabsTrigger>
                <TabsTrigger value="sql">SQL</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generateData} 
            className="w-full animate-pulse-hover"
            disabled={fields.filter(f => f.name).length === 0}
          >
            Generate Mock Data
          </Button>

          {/* Generated Data */}
          <AnimatePresence>
            {generatedData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Generated Data</label>
                  <div className="flex gap-2">
                    <CopyButton text={generatedData} />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={downloadData}
                      className="animate-pulse-hover"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={generatedData}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Data Types Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="text-sm font-medium">Available Data Types:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li><strong>Name:</strong> Random first and last names</li>
              <li><strong>Email:</strong> Realistic email addresses</li>
              <li><strong>Phone:</strong> US phone number format</li>
              <li><strong>Address:</strong> Full US addresses</li>
              <li><strong>Number:</strong> Random numbers within range</li>
              <li><strong>Choice:</strong> Pick from custom options</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}