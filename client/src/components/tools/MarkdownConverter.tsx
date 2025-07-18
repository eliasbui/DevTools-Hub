import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CopyButton } from '@/components/common/CopyButton';
import { FileText, Eye, Code } from 'lucide-react';

export function MarkdownConverter() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');

  const convertToHtml = (md: string) => {
    // Simple markdown to HTML conversion
    let html = md;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Code (inline)
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Links
    html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, '<img src="$2" alt="$1" />');
    
    // Lists
    html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>');
    
    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li>.*?<\/li>)(?:\n<li>.*?<\/li>)*/g, (match) => {
      return '<ul>' + match + '</ul>';
    });
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    if (html && !html.includes('<p>')) {
      html = '<p>' + html + '</p>';
    }
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><br><\/p>/g, '');
    
    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    return html;
  };

  const handleMarkdownChange = (value: string) => {
    setMarkdown(value);
    setHtml(convertToHtml(value));
  };

  const loadSampleMarkdown = () => {
    const sample = `# Sample Markdown Document

## Introduction

This is a **sample markdown document** with various formatting options.

### Features

- **Bold text** and *italic text*
- \`Inline code\` and code blocks
- [Links](https://example.com) and images
- Lists and tables

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

### Lists

#### Unordered List
- Item 1
- Item 2
- Item 3

#### Ordered List
1. First item
2. Second item
3. Third item

### Quotes

> This is a blockquote.
> It can span multiple lines.

### Other Elements

- ~~Strikethrough text~~
- Horizontal rule below:

---

**Note**: This converter supports basic markdown syntax.`;
    
    setMarkdown(sample);
    setHtml(convertToHtml(sample));
  };

  const generateCSS = () => {
    return `/* Markdown Styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

h1 {
  font-size: 2em;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

h3 {
  font-size: 1.25em;
}

p {
  margin-bottom: 16px;
}

code {
  background-color: #f6f8fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

pre {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 16px 0;
}

pre code {
  background-color: transparent;
  padding: 0;
}

blockquote {
  border-left: 4px solid #ddd;
  padding-left: 16px;
  margin: 0 0 16px 0;
  color: #666;
}

ul, ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

li {
  margin-bottom: 4px;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  max-width: 100%;
  height: auto;
}

hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 24px 0;
}

del {
  color: #999;
}

strong {
  font-weight: 600;
}

em {
  font-style: italic;
}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>Markdown Converter</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Markdown Input</h3>
            <Button onClick={loadSampleMarkdown} variant="outline" size="sm">
              Load Sample
            </Button>
          </div>

          {/* Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Markdown Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Markdown</label>
              <Textarea
                value={markdown}
                onChange={(e) => handleMarkdownChange(e.target.value)}
                placeholder="Enter markdown text here..."
                className="min-h-[400px] font-mono text-sm"
              />
            </div>

            {/* HTML Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">HTML Output</label>
                <CopyButton text={html} size="sm" />
              </div>
              <Textarea
                value={html}
                readOnly
                className="min-h-[400px] font-mono text-sm bg-muted/50"
              />
            </div>
          </div>

          {/* Preview */}
          {html && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preview</h3>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList>
                  <TabsTrigger value="preview">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="html">
                    <Code className="w-4 h-4 mr-2" />
                    HTML
                  </TabsTrigger>
                  <TabsTrigger value="css">
                    <Code className="w-4 h-4 mr-2" />
                    CSS
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-2">
                  <div className="p-6 border rounded-lg bg-white">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="html" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Generated HTML</label>
                    <CopyButton text={html} />
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/50 max-h-96 overflow-auto">
                    <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                      {html}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="css" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Suggested CSS</label>
                    <CopyButton text={generateCSS()} />
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/50 max-h-96 overflow-auto">
                    <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                      {generateCSS()}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Markdown Guide */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Markdown Syntax Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Headers</h4>
                <pre className="text-muted-foreground font-mono text-xs">
{`# H1 Header
## H2 Header
### H3 Header`}
                </pre>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Text Formatting</h4>
                <pre className="text-muted-foreground font-mono text-xs">
{`**Bold text**
*Italic text*
~~Strikethrough~~
\`inline code\``}
                </pre>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Lists</h4>
                <pre className="text-muted-foreground font-mono text-xs">
{`- Unordered item
* Another item
1. Ordered item
2. Another ordered item`}
                </pre>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Links & Images</h4>
                <pre className="text-muted-foreground font-mono text-xs">
{`[Link text](https://example.com)
![Alt text](image.jpg)`}
                </pre>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Code Blocks</h4>
                <pre className="text-muted-foreground font-mono text-xs">
{`\`\`\`javascript
function hello() {
  console.log("Hello!");
}
\`\`\``}
                </pre>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Blockquotes</h4>
                <pre className="text-muted-foreground font-mono text-xs">
{`> This is a blockquote
> It can span multiple lines`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}