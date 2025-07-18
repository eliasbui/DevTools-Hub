import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { diffStrings } from '@/utils/formatters';
import { GitCompare } from 'lucide-react';

export function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState<Array<{ type: 'added' | 'removed' | 'unchanged'; value: string }>>([]);

  const handleCompare = () => {
    const result = diffStrings(text1, text2);
    setDiff(result);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GitCompare className="w-5 h-5 text-primary" />
          <span>Text Diff Checker</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Original Text</label>
              <Textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                placeholder="Enter original text..."
                className="min-h-[150px] md:min-h-[200px] font-mono text-xs md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Modified Text</label>
              <Textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                placeholder="Enter modified text..."
                className="min-h-[150px] md:min-h-[200px] font-mono text-xs md:text-sm"
              />
            </div>
          </div>

          {/* Compare Button */}
          <div className="flex justify-center">
            <Button onClick={handleCompare} size="sm">
              Compare Texts
            </Button>
          </div>

          {/* Diff Results */}
          {diff.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Differences</h3>
              <div className="border rounded-lg bg-muted/50 p-4 max-h-96 overflow-auto">
                <div className="font-mono text-sm space-y-1">
                  {diff.map((item, index) => (
                    <div
                      key={index}
                      className={`px-2 py-1 rounded ${
                        item.type === 'added'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                          : item.type === 'removed'
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                          : 'text-foreground'
                      }`}
                    >
                      <span className="inline-block w-6 text-xs">
                        {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' '}
                      </span>
                      {item.value}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-200 dark:bg-green-900/40 rounded"></div>
                  <span>Added</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-200 dark:bg-red-900/40 rounded"></div>
                  <span>Removed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <span>Unchanged</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
