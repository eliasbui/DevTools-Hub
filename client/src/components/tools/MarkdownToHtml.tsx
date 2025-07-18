import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { FileText, Eye, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  const convertMarkdownToHtml = (md: string): string => {
    if (!md) return '';

    let html = md;

    // Escape HTML
    html = html.replace(/&/g, '&amp;');
    html = html.replace(/</g, '&lt;');
    html = html.replace(/>/g, '&gt;');

    // Headers (h1-h6)
    html = html.replace(/^###### (.*?)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*?)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/___(.*?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // Unordered lists
    html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\+ (.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive li elements with ul
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      return '<ul>' + match + '</ul>';
    });

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ordered">$1</li>');
    
    // Wrap consecutive ordered li elements with ol
    html = html.replace(/(<li class="ordered">.*<\/li>\n?)+/g, (match) => {
      return '<ol>' + match.replace(/ class="ordered"/g, '') + '</ol>';
    });

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Merge consecutive blockquotes
    html = html.replace(/(<\/blockquote>\n<blockquote>)/g, '\n');

    // Horizontal rules
    html = html.replace(/^([-*_]){3,}$/gm, '<hr />');

    // Line breaks
    html = html.replace(/  $/gm, '<br />');

    // Paragraphs
    html = html.split('\n\n').map(paragraph => {
      // Don't wrap elements that are already block-level
      if (paragraph.match(/^<(h[1-6]|ul|ol|blockquote|pre|hr)/)) {
        return paragraph;
      }
      return paragraph.trim() ? `<p>${paragraph}</p>` : '';
    }).join('\n\n');

    return html;
  };

  useEffect(() => {
    setHtml(convertMarkdownToHtml(markdown));
  }, [markdown]);

  const sampleMarkdown = `# Markdown Example

This is a **bold** text and this is *italic* text. You can also use ***bold and italic*** together.

## Lists

### Unordered List
- First item
- Second item
  - Nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

## Links and Images

[Visit GitHub](https://github.com)

![Placeholder Image](https://via.placeholder.com/150)

## Code

Inline code: \`const hello = "world";\`

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Other Elements

> This is a blockquote.
> It can span multiple lines.

Use ~~strikethrough~~ for deleted text.

---

That's a horizontal rule above.`;

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
              transition={{ duration: 0.5 }}
            >
              <FileText className="w-5 h-5" />
            </motion.div>
            <span>Markdown to HTML</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sample Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMarkdown(sampleMarkdown)}
            className=""
          >
            Load Sample
          </Button>

          {/* Editor/Preview Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Markdown Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Markdown Input</label>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Enter your Markdown here..."
                className="min-h-[500px] font-mono text-sm smooth-transition focus:scale-105"
              />
            </div>

            {/* HTML Output / Preview */}
            <div className="space-y-2">
              <Tabs defaultValue="preview" className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Output</label>
                  <TabsList>
                    <TabsTrigger value="preview" className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="html" className="text-xs">
                      <Code className="w-3 h-3 mr-1" />
                      HTML
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="preview" className="mt-0">
                  <div 
                    className="min-h-[500px] p-4 bg-background border rounded-md overflow-auto prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </TabsContent>

                <TabsContent value="html" className="mt-0">
                  <div className="relative">
                    <Textarea
                      value={html}
                      readOnly
                      className="min-h-[500px] font-mono text-sm bg-muted"
                    />
                    <AnimatePresence>
                      {html && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute top-2 right-2"
                        >
                          <CopyButton text={html} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Markdown Cheatsheet */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-medium mb-2">Markdown Quick Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div># H1 Header</div>
                <div>## H2 Header</div>
                <div>**bold text**</div>
                <div>*italic text*</div>
                <div>[link text](url)</div>
              </div>
              <div className="space-y-1">
                <div>![alt text](image-url)</div>
                <div>`inline code`</div>
                <div>```code block```</div>
                <div>&gt; blockquote</div>
                <div>--- (horizontal rule)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}