import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, Copy, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/common/CopyButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  year?: string;
}

interface NextRun {
  date: Date;
  relative: string;
}

const COMMON_EXPRESSIONS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
  { label: 'Every weekday at 6 PM', value: '0 18 * * 1-5' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'First day of month at noon', value: '0 12 1 * *' },
  { label: 'Every Sunday at 2:30 AM', value: '30 2 * * 0' },
  { label: 'Every quarter (Jan, Apr, Jul, Oct)', value: '0 0 1 1,4,7,10 *' }
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export function CronExpressionBuilder() {
  const [mode, setMode] = useState<'builder' | 'manual'>('builder');
  const [expression, setExpression] = useState('0 * * * *');
  const [parts, setParts] = useState<CronParts>({
    minute: '0',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*'
  });
  const [selectedMinutes, setSelectedMinutes] = useState<Set<number>>(new Set([0]));
  const [selectedHours, setSelectedHours] = useState<Set<number>>(new Set());
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
  const [selectedWeekdays, setSelectedWeekdays] = useState<Set<number>>(new Set());
  const [humanReadable, setHumanReadable] = useState('');
  const [nextRuns, setNextRuns] = useState<NextRun[]>([]);
  const [error, setError] = useState('');

  // Parse cron expression to human readable
  const parseToHumanReadable = (expr: string) => {
    try {
      const [minute, hour, dayOfMonth, month, dayOfWeek] = expr.split(' ');
      let description = 'At ';

      // Time
      if (minute === '*' && hour === '*') {
        description = 'Every minute';
      } else if (minute === '*') {
        description = `Every minute of hour ${hour}`;
      } else if (hour === '*') {
        description = `At minute ${minute} of every hour`;
      } else {
        const h = parseInt(hour);
        const m = parseInt(minute);
        if (!isNaN(h) && !isNaN(m)) {
          const period = h >= 12 ? 'PM' : 'AM';
          const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
          description = `At ${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
        } else {
          description = `At ${hour}:${minute}`;
        }
      }

      // Day of week
      if (dayOfWeek !== '*') {
        const days = dayOfWeek.split(',').map(d => {
          const dayNum = parseInt(d);
          return isNaN(dayNum) ? d : DAYS_OF_WEEK[dayNum] || d;
        }).join(', ');
        description += ` on ${days}`;
      }

      // Day of month
      if (dayOfMonth !== '*' && dayOfWeek === '*') {
        description += ` on day ${dayOfMonth} of the month`;
      }

      // Month
      if (month !== '*') {
        const months = month.split(',').map(m => {
          const monthNum = parseInt(m);
          return isNaN(monthNum) ? m : MONTHS[monthNum - 1] || m;
        }).join(', ');
        description += ` in ${months}`;
      }

      // Special patterns
      if (minute.includes('*/')) {
        const interval = minute.split('/')[1];
        description = `Every ${interval} minutes`;
      }
      if (hour.includes('*/')) {
        const interval = hour.split('/')[1];
        description = `Every ${interval} hours`;
      }

      return description;
    } catch {
      return 'Invalid expression';
    }
  };

  // Calculate next run times
  const calculateNextRuns = (expr: string, count: number = 5): NextRun[] => {
    try {
      const runs: NextRun[] = [];
      const now = new Date();
      const [minute, hour, dayOfMonth, month, dayOfWeek] = expr.split(' ');

      // Simple implementation for demonstration
      // In production, use a proper cron parser library
      for (let i = 0; i < count; i++) {
        const nextDate = new Date(now);
        nextDate.setSeconds(0);
        nextDate.setMilliseconds(0);

        // Add time based on the pattern
        if (minute === '*') {
          nextDate.setMinutes(nextDate.getMinutes() + i);
        } else if (minute.includes('*/')) {
          const interval = parseInt(minute.split('/')[1]);
          nextDate.setMinutes(nextDate.getMinutes() + (i * interval));
        } else {
          const targetMinute = parseInt(minute);
          if (!isNaN(targetMinute)) {
            nextDate.setMinutes(targetMinute);
            if (hour !== '*' && !hour.includes('*/')) {
              const targetHour = parseInt(hour);
              if (!isNaN(targetHour)) {
                nextDate.setHours(targetHour);
              }
            }
            nextDate.setDate(nextDate.getDate() + i);
          }
        }

        // Calculate relative time
        const diff = nextDate.getTime() - now.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        let relative = '';
        if (days > 0) {
          relative = `in ${days} day${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
          relative = `in ${hours} hour${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
          relative = `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
          relative = 'now';
        }

        runs.push({ date: nextDate, relative });
      }

      return runs;
    } catch {
      return [];
    }
  };

  // Update expression from builder
  const updateExpressionFromBuilder = () => {
    const minutePart = selectedMinutes.size === 0 ? '*' : 
                       selectedMinutes.size === 60 ? '*' :
                       Array.from(selectedMinutes).sort((a, b) => a - b).join(',');
    
    const hourPart = selectedHours.size === 0 ? '*' :
                     selectedHours.size === 24 ? '*' :
                     Array.from(selectedHours).sort((a, b) => a - b).join(',');
    
    const dayPart = selectedDays.size === 0 ? '*' :
                    selectedDays.size === 31 ? '*' :
                    Array.from(selectedDays).sort((a, b) => a - b).join(',');
    
    const monthPart = selectedMonths.size === 0 ? '*' :
                      selectedMonths.size === 12 ? '*' :
                      Array.from(selectedMonths).sort((a, b) => a - b).join(',');
    
    const weekdayPart = selectedWeekdays.size === 0 ? '*' :
                        selectedWeekdays.size === 7 ? '*' :
                        Array.from(selectedWeekdays).sort((a, b) => a - b).join(',');
    
    const newExpression = `${minutePart} ${hourPart} ${dayPart} ${monthPart} ${weekdayPart}`;
    setExpression(newExpression);
  };

  // Update builder from expression
  const updateBuilderFromExpression = (expr: string) => {
    try {
      const [minute, hour, dayOfMonth, month, dayOfWeek] = expr.split(' ');
      
      // Parse minutes
      const newMinutes = new Set<number>();
      if (minute !== '*' && !minute.includes('/')) {
        minute.split(',').forEach(m => {
          const num = parseInt(m);
          if (!isNaN(num) && num >= 0 && num <= 59) {
            newMinutes.add(num);
          }
        });
      }
      setSelectedMinutes(newMinutes);
      
      // Parse hours
      const newHours = new Set<number>();
      if (hour !== '*' && !hour.includes('/')) {
        hour.split(',').forEach(h => {
          const num = parseInt(h);
          if (!isNaN(num) && num >= 0 && num <= 23) {
            newHours.add(num);
          }
        });
      }
      setSelectedHours(newHours);
      
      // Parse days
      const newDays = new Set<number>();
      if (dayOfMonth !== '*' && !dayOfMonth.includes('/')) {
        dayOfMonth.split(',').forEach(d => {
          const num = parseInt(d);
          if (!isNaN(num) && num >= 1 && num <= 31) {
            newDays.add(num);
          }
        });
      }
      setSelectedDays(newDays);
      
      // Parse months
      const newMonths = new Set<number>();
      if (month !== '*' && !month.includes('/')) {
        month.split(',').forEach(m => {
          const num = parseInt(m);
          if (!isNaN(num) && num >= 1 && num <= 12) {
            newMonths.add(num);
          }
        });
      }
      setSelectedMonths(newMonths);
      
      // Parse weekdays
      const newWeekdays = new Set<number>();
      if (dayOfWeek !== '*' && !dayOfWeek.includes('/')) {
        dayOfWeek.split(',').forEach(w => {
          const num = parseInt(w);
          if (!isNaN(num) && num >= 0 && num <= 6) {
            newWeekdays.add(num);
          }
        });
      }
      setSelectedWeekdays(newWeekdays);
    } catch {
      // Invalid expression
    }
  };

  useEffect(() => {
    setHumanReadable(parseToHumanReadable(expression));
    setNextRuns(calculateNextRuns(expression));
  }, [expression]);

  useEffect(() => {
    if (mode === 'builder') {
      updateExpressionFromBuilder();
    }
  }, [selectedMinutes, selectedHours, selectedDays, selectedMonths, selectedWeekdays, mode]);

  const toggleSelection = (value: number, selected: Set<number>, setSelected: (s: Set<number>) => void) => {
    const newSet = new Set(selected);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setSelected(newSet);
  };

  const selectAll = (max: number, setSelected: (s: Set<number>) => void, start: number = 0) => {
    const all = new Set<number>();
    for (let i = start; i <= max; i++) {
      all.add(i);
    }
    setSelected(all);
  };

  const clearAll = (setSelected: (s: Set<number>) => void) => {
    setSelected(new Set());
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
              <Clock className="w-5 h-5" />
            </motion.div>
            <span>Cron Expression Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selector */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'builder' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="builder">Visual Builder</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-4">
              {/* Minutes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Minutes (0-59)</Label>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectAll(59, setSelectedMinutes)}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearAll(setSelectedMinutes)}
                    >
                      None
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-10 gap-1 p-2 border rounded">
                  {Array.from({ length: 60 }, (_, i) => (
                    <Toggle
                      key={i}
                      size="sm"
                      pressed={selectedMinutes.has(i)}
                      onPressedChange={() => toggleSelection(i, selectedMinutes, setSelectedMinutes)}
                      className="h-8 w-8 text-xs"
                    >
                      {i}
                    </Toggle>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Hours (0-23)</Label>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectAll(23, setSelectedHours)}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearAll(setSelectedHours)}
                    >
                      None
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-1 p-2 border rounded">
                  {Array.from({ length: 24 }, (_, i) => (
                    <Toggle
                      key={i}
                      size="sm"
                      pressed={selectedHours.has(i)}
                      onPressedChange={() => toggleSelection(i, selectedHours, setSelectedHours)}
                      className="h-8 text-xs"
                    >
                      {i}
                    </Toggle>
                  ))}
                </div>
              </div>

              {/* Days of Month */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Days of Month (1-31)</Label>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectAll(31, setSelectedDays, 1)}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearAll(setSelectedDays)}
                    >
                      None
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 p-2 border rounded">
                  {Array.from({ length: 31 }, (_, i) => (
                    <Toggle
                      key={i + 1}
                      size="sm"
                      pressed={selectedDays.has(i + 1)}
                      onPressedChange={() => toggleSelection(i + 1, selectedDays, setSelectedDays)}
                      className="h-8 text-xs"
                    >
                      {i + 1}
                    </Toggle>
                  ))}
                </div>
              </div>

              {/* Months */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Months</Label>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectAll(12, setSelectedMonths, 1)}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearAll(setSelectedMonths)}
                    >
                      None
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 p-2 border rounded">
                  {MONTHS.map((month, i) => (
                    <Toggle
                      key={i}
                      size="sm"
                      pressed={selectedMonths.has(i + 1)}
                      onPressedChange={() => toggleSelection(i + 1, selectedMonths, setSelectedMonths)}
                      className="h-8 text-xs"
                    >
                      {month.slice(0, 3)}
                    </Toggle>
                  ))}
                </div>
              </div>

              {/* Days of Week */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Days of Week</Label>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectAll(6, setSelectedWeekdays)}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearAll(setSelectedWeekdays)}
                    >
                      None
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 p-2 border rounded">
                  {DAYS_OF_WEEK.map((day, i) => (
                    <Toggle
                      key={i}
                      size="sm"
                      pressed={selectedWeekdays.has(i)}
                      onPressedChange={() => toggleSelection(i, selectedWeekdays, setSelectedWeekdays)}
                      className="h-8 text-xs"
                    >
                      {day.slice(0, 3)}
                    </Toggle>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <Label>Cron Expression</Label>
                <div className="flex gap-2">
                  <Input
                    value={expression}
                    onChange={(e) => {
                      setExpression(e.target.value);
                      updateBuilderFromExpression(e.target.value);
                    }}
                    placeholder="* * * * *"
                    className="font-mono"
                  />
                  <CopyButton value={expression} />
                </div>
              </div>

              {/* Common Expressions */}
              <div className="space-y-2">
                <Label>Common Expressions</Label>
                <Select
                  onValueChange={(value) => {
                    setExpression(value);
                    updateBuilderFromExpression(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a common expression" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_EXPRESSIONS.map((expr) => (
                      <SelectItem key={expr.value} value={expr.value}>
                        {expr.label} - <span className="font-mono text-xs">{expr.value}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {/* Expression Display */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Generated Expression</h4>
              <CopyButton value={expression} />
            </div>
            <code className="block text-lg font-mono">{expression}</code>
            <p className="text-sm text-muted-foreground">{humanReadable}</p>
          </div>

          {/* Next Runs */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Next Runs
            </h4>
            <div className="space-y-2">
              {nextRuns.map((run, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <span>{run.date.toLocaleString()}</span>
                  <Badge variant="secondary">{run.relative}</Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cron Format Guide */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2 text-xs">
                <p className="font-medium">Cron Format: minute hour day month weekday</p>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  <div>
                    <p className="font-medium">Minute</p>
                    <p className="text-muted-foreground">0-59</p>
                  </div>
                  <div>
                    <p className="font-medium">Hour</p>
                    <p className="text-muted-foreground">0-23</p>
                  </div>
                  <div>
                    <p className="font-medium">Day</p>
                    <p className="text-muted-foreground">1-31</p>
                  </div>
                  <div>
                    <p className="font-medium">Month</p>
                    <p className="text-muted-foreground">1-12</p>
                  </div>
                  <div>
                    <p className="font-medium">Weekday</p>
                    <p className="text-muted-foreground">0-6 (Sun-Sat)</p>
                  </div>
                </div>
                <p className="mt-2">Special characters: * (any), , (list), - (range), / (step)</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}