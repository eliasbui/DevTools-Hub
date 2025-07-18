import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/common/CopyButton';
import { generateLoremIpsum } from '@/utils/generators';
import { Type } from 'lucide-react';

export function LoremGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50);
  const [output, setOutput] = useState('');

  const handleGenerate = () => {
    const lorem = generateLoremIpsum(paragraphs, wordsPerParagraph);
    setOutput(lorem);
  };

  const handleQuickGenerate = (p: number, w: number) => {
    const lorem = generateLoremIpsum(p, w);
    setOutput(lorem);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-primary" />
          <span>Lorem Ipsum Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Options */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Paragraphs:</label>
              <Input
                type="number"
                value={paragraphs}
                onChange={(e) => setParagraphs(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="20"
                className="w-20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Words per paragraph:</label>
              <Input
                type="number"
                value={wordsPerParagraph}
                onChange={(e) => setWordsPerParagraph(Math.max(10, parseInt(e.target.value) || 50))}
                min="10"
                max="200"
                className="w-20"
              />
            </div>
            <Button onClick={handleGenerate} size="sm">
              Generate
            </Button>
          </div>

          {/* Quick Options */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleQuickGenerate(1, 30)} variant="outline" size="sm">
              Short (1 paragraph)
            </Button>
            <Button onClick={() => handleQuickGenerate(3, 50)} variant="outline" size="sm">
              Medium (3 paragraphs)
            </Button>
            <Button onClick={() => handleQuickGenerate(5, 60)} variant="outline" size="sm">
              Long (5 paragraphs)
            </Button>
            <Button onClick={() => handleQuickGenerate(1, 10)} variant="outline" size="sm">
              Sentence
            </Button>
          </div>

          {/* Output */}
          {output && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Generated Text</h3>
                <CopyButton text={output} variant="outline" size="default" />
              </div>
              <div className="p-4 border rounded-lg bg-muted/50 max-h-96 overflow-auto">
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {output}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {output.split('\n\n').length} paragraphs, {output.split(' ').length} words, {output.length} characters
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
