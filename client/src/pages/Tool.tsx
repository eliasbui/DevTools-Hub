import { useParams } from 'wouter';
import { Layout } from '@/components/layout/Layout';
import { JSONFormatter } from '@/components/tools/JSONFormatter';
import { Base64Tool } from '@/components/tools/Base64Tool';
import { URLEncoder } from '@/components/tools/URLEncoder';
import { TimestampConverter } from '@/components/tools/TimestampConverter';
import { JWTDebugger } from '@/components/tools/JWTDebugger';
import { RegexTester } from '@/components/tools/RegexTester';
import { TextDiff } from '@/components/tools/TextDiff';
import { UUIDGenerator } from '@/components/tools/UUIDGenerator';
import { HashGenerator } from '@/components/tools/HashGenerator';
import { LoremGenerator } from '@/components/tools/LoremGenerator';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { HTTPClient } from '@/components/tools/HTTPClient';
import { CSSGridGenerator } from '@/components/tools/CSSGridGenerator';
import { ColorPaletteGenerator } from '@/components/tools/ColorPaletteGenerator';
import { BoxShadowGenerator } from '@/components/tools/BoxShadowGenerator';
import { TextCaseConverter } from '@/components/tools/TextCaseConverter';
import { QRCodeGenerator } from '@/components/tools/QRCodeGenerator';
import { CSVConverter } from '@/components/tools/CSVConverter';
import { MarkdownConverter } from '@/components/tools/MarkdownConverter';
import { DataVisualization } from '@/components/tools/DataVisualization';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const tools = {
  'json-formatter': {
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data',
    component: JSONFormatter,
  },
  'base64-tool': {
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings',
    component: Base64Tool,
  },
  'url-encoder': {
    name: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs',
    component: URLEncoder,
  },
  'timestamp-converter': {
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates',
    component: TimestampConverter,
  },
  'jwt-debugger': {
    name: 'JWT Debugger',
    description: 'Parse and analyze JWT tokens',
    component: JWTDebugger,
  },
  'regex-tester': {
    name: 'Regex Tester',
    description: 'Test regular expressions against text',
    component: RegexTester,
  },
  'text-diff': {
    name: 'Text Diff Checker',
    description: 'Compare two texts and highlight differences',
    component: TextDiff,
  },
  'uuid-generator': {
    name: 'UUID Generator',
    description: 'Generate unique identifiers',
    component: UUIDGenerator,
  },
  'hash-generator': {
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
    component: HashGenerator,
  },
  'lorem-generator': {
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text',
    component: LoremGenerator,
  },
  'password-generator': {
    name: 'Password Generator',
    description: 'Generate secure passwords with customizable options',
    component: PasswordGenerator,
  },
  'http-client': {
    name: 'HTTP Client',
    description: 'Send HTTP requests and test APIs',
    component: HTTPClient,
  },
  'css-grid-generator': {
    name: 'CSS Grid Generator',
    description: 'Create CSS Grid layouts with visual editor',
    component: CSSGridGenerator,
  },
  'color-palette': {
    name: 'Color Palette Generator',
    description: 'Generate harmonious color schemes',
    component: ColorPaletteGenerator,
  },
  'box-shadow-generator': {
    name: 'Box Shadow Generator',
    description: 'Create CSS box shadows with visual editor',
    component: BoxShadowGenerator,
  },
  'text-case-converter': {
    name: 'Text Case Converter',
    description: 'Convert text between different cases',
    component: TextCaseConverter,
  },
  'qr-code-generator': {
    name: 'QR Code Generator',
    description: 'Generate QR codes for various content types',
    component: QRCodeGenerator,
  },
  'csv-converter': {
    name: 'CSV Converter',
    description: 'Convert CSV data to JSON, XML, YAML, or SQL',
    component: CSVConverter,
  },
  'markdown-converter': {
    name: 'Markdown Converter',
    description: 'Convert Markdown to HTML with live preview',
    component: MarkdownConverter,
  },
  'data-visualization': {
    name: 'Data Visualization',
    description: 'Visualize JSON, XML, YAML, and CSV data as interactive graphs',
    component: DataVisualization,
  },
};

export function Tool() {
  const params = useParams();
  const toolId = params.id as string;
  const tool = tools[toolId as keyof typeof tools];

  if (!tool) {
    return (
      <Layout title="Tool Not Found" description="The requested tool could not be found">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl font-bold">Tool Not Found</h1>
            </div>
            <p className="text-muted-foreground">
              The tool "{toolId}" does not exist or has been moved.
            </p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const ToolComponent = tool.component;

  return (
    <Layout title={tool.name} description={tool.description}>
      <ToolComponent />
    </Layout>
  );
}
