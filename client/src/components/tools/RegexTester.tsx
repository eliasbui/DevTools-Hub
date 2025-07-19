import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { testRegex } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: false, i: false, m: false, s: false });
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleTest = () => {
    const flagString = Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag, _]) => flag)
      .join('');

    const result = testRegex(pattern, flagString, testString);
    setMatches(result.matches);
    setIsValid(result.isValid);
    setError(result.error || '');

    if (!result.isValid) {
      toast({
        title: "Regex Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-primary" />
          <span>Regex Tester</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pattern Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Regular Expression</label>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-mono">/</span>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="flex-1 font-mono"
              />
              <span className="text-lg font-mono">/</span>
              <div className="flex space-x-2">
                {Object.entries(flags).map(([flag, enabled]) => (
                  <div key={flag} className="flex items-center space-x-1">
                    <Checkbox
                      id={flag}
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setFlags(prev => ({ ...prev, [flag]: !!checked }))
                      }
                    />
                    <label htmlFor={flag} className="text-sm font-mono">{flag}</label>
                  </div>
                ))}
              </div>
            </div>
            {pattern && (
              <div className={`flex items-center space-x-2 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {isValid ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {isValid ? 'Valid regex' : error}
                </span>
              </div>
            )}
          </div>

          {/* Test String */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test String</label>
            <Textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against..."
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          {/* Test Button */}
          <Button onClick={handleTest} className="w-full">
            Test Regex
          </Button>

          {/* Results */}
          {matches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Matches ({matches.length})
              </h3>
              <div className="space-y-2">
                {matches.map((match, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Match {index + 1}</span>
                      <span className="text-sm text-muted-foreground">
                        Position: {match.index} - {(match.index || 0) + match[0].length}
                      </span>
                    </div>
                    <div className="font-mono text-sm text-green-600 dark:text-green-400">
                      {match[0]}
                    </div>
                    {match.length > 1 && (
                      <div className="mt-2 space-y-1">
                        <span className="text-sm font-medium">Groups:</span>
                        {match.slice(1).map((group, groupIndex) => (
                          <div key={groupIndex} className="font-mono text-sm">
                            Group {groupIndex + 1}: {group}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {pattern && testString && matches.length === 0 && isValid && (
            <div className="text-center py-8 text-muted-foreground">
              No matches found
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Description Section */}
      <div className="border-t p-6 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-4">
          <h3 className="text-lg font-semibold">About Regex Tester</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Test and debug regular expressions (regex) in real-time. This tool helps you build, test, and understand regex patterns for text matching and extraction.
            </p>
            <p>
              <strong>Features:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Real-time pattern validation</li>
              <li>Highlight all matches in your test string</li>
              <li>Display captured groups for each match</li>
              <li>Show match positions and lengths</li>
              <li>Support for all JavaScript regex flags (g, i, m, s, u, y)</li>
            </ul>
            <p>
              <strong>Common Regex Patterns:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>\d+</code> - Match one or more digits</li>
              <li><code>[a-zA-Z]+</code> - Match one or more letters</li>
              <li><code>\w+@\w+\.\w+</code> - Simple email pattern</li>
              <li><code>https?://[^\s]+</code> - Match URLs</li>
              <li><code>\b\w+\b</code> - Match whole words</li>
            </ul>
            <p className="text-xs">
              <strong>Tip:</strong> Use the 'g' flag to find all matches, not just the first one. The 'i' flag makes matching case-insensitive.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
