import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/common/CopyButton';
import { formatTimestamp, parseTimestamp } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Clock } from 'lucide-react';

export function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const { toast } = useToast();

  const handleTimestampToDate = () => {
    try {
      const num = parseInt(timestamp);
      if (isNaN(num)) {
        throw new Error('Invalid timestamp');
      }
      const formatted = formatTimestamp(num);
      setDateTime(formatted);
    } catch (e) {
      toast({
        title: "Conversion Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDateToTimestamp = () => {
    try {
      const ts = parseTimestamp(dateTime);
      setTimestamp(ts.toString());
    } catch (e) {
      toast({
        title: "Conversion Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now.toString());
    setDateTime(formatTimestamp(now));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>Timestamp Converter</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Timestamp */}
          <div className="flex items-center space-x-4">
            <Button onClick={handleCurrentTimestamp} variant="outline">
              Current Timestamp
            </Button>
            <span className="text-sm text-muted-foreground">
              Current: {Math.floor(Date.now() / 1000)} ({new Date().toISOString()})
            </span>
          </div>

          {/* Timestamp to Date */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timestamp to Date</h3>
            <div className="flex space-x-4">
              <Input
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="Enter Unix timestamp..."
                className="flex-1"
              />
              <Button onClick={handleTimestampToDate}>
                Convert
              </Button>
            </div>
            {dateTime && (
              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <span className="font-mono text-sm">{dateTime}</span>
                <CopyButton text={dateTime} />
              </div>
            )}
          </div>

          {/* Date to Timestamp */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Date to Timestamp</h3>
            <div className="flex space-x-4">
              <Input
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                placeholder="Enter date (ISO format)..."
                className="flex-1"
              />
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">EST</SelectItem>
                  <SelectItem value="PST">PST</SelectItem>
                  <SelectItem value="GMT">GMT</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleDateToTimestamp}>
                Convert
              </Button>
            </div>
            {timestamp && (
              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <span className="font-mono text-sm">{timestamp}</span>
                <CopyButton text={timestamp} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
