import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CopyButton } from '@/components/common/CopyButton';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, ArrowLeftRight } from 'lucide-react';

export function CSVConverter() {
  const [csvData, setCsvData] = useState('');
  const [outputFormat, setOutputFormat] = useState<'json' | 'xml' | 'yaml' | 'sql'>('json');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [tableName, setTableName] = useState('data');
  const [result, setResult] = useState('');
  const { toast } = useToast();

  const parseCsv = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      
      for (let j = 0; j < values.length; j++) {
        const key = hasHeader ? headers[j] : `column_${j + 1}`;
        row[key] = values[j];
      }
      data.push(row);
    }

    return data;
  };

  const convertToJson = (data: any[]) => {
    return JSON.stringify(data, null, 2);
  };

  const convertToXml = (data: any[]) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    
    data.forEach((row, index) => {
      xml += `  <record id="${index + 1}">\n`;
      Object.entries(row).forEach(([key, value]) => {
        xml += `    <${key}>${value}</${key}>\n`;
      });
      xml += '  </record>\n';
    });
    
    xml += '</root>';
    return xml;
  };

  const convertToYaml = (data: any[]) => {
    let yaml = '';
    data.forEach((row, index) => {
      yaml += `- record_${index + 1}:\n`;
      Object.entries(row).forEach(([key, value]) => {
        yaml += `    ${key}: "${value}"\n`;
      });
    });
    return yaml;
  };

  const convertToSql = (data: any[]) => {
    if (data.length === 0) return '';
    
    const columns = Object.keys(data[0]);
    let sql = `CREATE TABLE ${tableName} (\n`;
    
    columns.forEach((col, index) => {
      sql += `  ${col} VARCHAR(255)${index < columns.length - 1 ? ',' : ''}\n`;
    });
    sql += ');\n\n';
    
    data.forEach(row => {
      const values = columns.map(col => `'${row[col].replace(/'/g, "''")}'`);
      sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    });
    
    return sql;
  };

  const handleConvert = () => {
    if (!csvData.trim()) {
      toast({
        title: "No Data",
        description: "Please enter CSV data to convert",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedData = parseCsv(csvData);
      
      if (parsedData.length === 0) {
        toast({
          title: "No Data",
          description: "Unable to parse CSV data",
          variant: "destructive",
        });
        return;
      }

      let convertedData = '';
      
      switch (outputFormat) {
        case 'json':
          convertedData = convertToJson(parsedData);
          break;
        case 'xml':
          convertedData = convertToXml(parsedData);
          break;
        case 'yaml':
          convertedData = convertToYaml(parsedData);
          break;
        case 'sql':
          convertedData = convertToSql(parsedData);
          break;
      }

      setResult(convertedData);
      toast({
        title: "Conversion Complete",
        description: `Successfully converted to ${outputFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Conversion Error",
        description: `Failed to convert CSV: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const loadSampleData = () => {
    const sampleCsv = `name,age,city,occupation
"John Doe",30,"New York","Software Engineer"
"Jane Smith",25,"San Francisco","Designer"
"Bob Johnson",35,"Chicago","Product Manager"
"Alice Brown",28,"Boston","Data Analyst"`;
    setCsvData(sampleCsv);
  };

  const downloadResult = () => {
    if (!result) return;
    
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_data.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validateCsv = () => {
    if (!csvData.trim()) return { valid: false, errors: ['No data provided'] };
    
    const lines = csvData.trim().split('\n');
    const errors = [];
    
    if (lines.length < 2 && hasHeader) {
      errors.push('CSV must have at least 2 lines when header is enabled');
    }
    
    const firstLineColumns = lines[0].split(delimiter).length;
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(delimiter).length;
      if (columns !== firstLineColumns) {
        errors.push(`Line ${i + 1} has ${columns} columns, expected ${firstLineColumns}`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  };

  const validation = validateCsv();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>CSV Converter</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Output Format</label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Delimiter</label>
              <Select value={delimiter} onValueChange={setDelimiter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=";">Semicolon (;)</SelectItem>
                  <SelectItem value="\t">Tab</SelectItem>
                  <SelectItem value="|">Pipe (|)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Has Header Row</label>
              <Switch
                checked={hasHeader}
                onCheckedChange={setHasHeader}
              />
            </div>

            {outputFormat === 'sql' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Table Name</label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="table_name"
                />
              </div>
            )}
          </div>

          {/* CSV Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">CSV Data</label>
              <Button onClick={loadSampleData} variant="outline" size="sm">
                Load Sample
              </Button>
            </div>
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here..."
              className="min-h-[200px] font-mono text-sm"
            />
            
            {/* Validation */}
            {csvData && !validation.valid && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <h4 className="font-medium text-red-800 mb-1">Validation Errors:</h4>
                <ul className="text-sm text-red-700">
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Convert Button */}
          <Button onClick={handleConvert} className="w-full">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Convert to {outputFormat.toUpperCase()}
          </Button>

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Converted Data</h3>
                <div className="flex space-x-2">
                  <CopyButton text={result} />
                  <Button onClick={downloadResult} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg bg-muted/50 max-h-96 overflow-auto">
                <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                  {result}
                </pre>
              </div>
            </div>
          )}

          {/* Format Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Format Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Comma-separated</h4>
                <pre className="text-muted-foreground font-mono text-xs">
{`name,age,city
"John Doe",30,"New York"
"Jane Smith",25,"San Francisco"`}
                </pre>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Tab-separated</h4>
                <pre className="text-muted-foreground font-mono text-xs">
{`name\tage\tcity
John Doe\t30\tNew York
Jane Smith\t25\tSan Francisco`}
                </pre>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Semicolon-separated</h4>
                <pre className="text-muted-foreground font-mono text-xs">
{`name;age;city
John Doe;30;New York
Jane Smith;25;San Francisco`}
                </pre>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Pipe-separated</h4>
                <pre className="text-muted-foreground font-mono text-xs">
{`name|age|city
John Doe|30|New York
Jane Smith|25|San Francisco`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}