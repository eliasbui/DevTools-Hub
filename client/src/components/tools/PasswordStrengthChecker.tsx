import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StrengthCriteria {
  label: string;
  regex: RegExp;
  met: boolean;
  weight: number;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  feedback: string[];
}

export function PasswordStrengthChecker() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Very Weak',
    color: 'bg-destructive',
    feedback: []
  });
  const [criteria, setCriteria] = useState<StrengthCriteria[]>([]);
  const [entropy, setEntropy] = useState(0);
  const [crackTime, setCrackTime] = useState('');

  const calculateEntropy = (pwd: string): number => {
    const charsets = {
      lowercase: /[a-z]/.test(pwd) ? 26 : 0,
      uppercase: /[A-Z]/.test(pwd) ? 26 : 0,
      numbers: /[0-9]/.test(pwd) ? 10 : 0,
      symbols: /[^a-zA-Z0-9]/.test(pwd) ? 32 : 0,
    };
    
    const possibleChars = Object.values(charsets).reduce((a, b) => a + b, 0);
    if (possibleChars === 0) return 0;
    
    return pwd.length * Math.log2(possibleChars);
  };

  const estimateCrackTime = (entropyBits: number): string => {
    // Assuming 1 billion guesses per second
    const guessesPerSecond = 1e9;
    const totalCombinations = Math.pow(2, entropyBits);
    const seconds = totalCombinations / (2 * guessesPerSecond); // Average case
    
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    
    const years = seconds / 31536000;
    if (years < 1000) return `${Math.round(years)} years`;
    if (years < 1e6) return `${Math.round(years / 1000)} thousand years`;
    if (years < 1e9) return `${Math.round(years / 1e6)} million years`;
    return 'Billions of years';
  };

  const evaluatePassword = (pwd: string) => {
    if (!pwd) {
      setStrength({
        score: 0,
        label: 'No Password',
        color: 'bg-muted',
        feedback: []
      });
      setCriteria([]);
      setEntropy(0);
      setCrackTime('');
      return;
    }

    // Define criteria with weights
    const criteriaList: StrengthCriteria[] = [
      { label: 'At least 8 characters', regex: /.{8,}/, met: false, weight: 20 },
      { label: 'At least 12 characters', regex: /.{12,}/, met: false, weight: 10 },
      { label: 'Contains lowercase letters', regex: /[a-z]/, met: false, weight: 10 },
      { label: 'Contains uppercase letters', regex: /[A-Z]/, met: false, weight: 10 },
      { label: 'Contains numbers', regex: /[0-9]/, met: false, weight: 10 },
      { label: 'Contains special characters', regex: /[^a-zA-Z0-9]/, met: false, weight: 15 },
      { label: 'No common patterns', regex: /^(?!.*(.)\1{2,})(?!.*(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)).*$/, met: false, weight: 10 },
      { label: 'No dictionary words', regex: /^(?!.*(password|admin|user|login|welcome|123456|qwerty)).*$/i, met: false, weight: 15 },
    ];

    // Check criteria
    let score = 0;
    const feedback: string[] = [];
    
    criteriaList.forEach(criterion => {
      criterion.met = criterion.regex.test(pwd);
      if (criterion.met) {
        score += criterion.weight;
      } else {
        feedback.push(criterion.label);
      }
    });

    // Calculate entropy
    const entropyBits = calculateEntropy(pwd);
    setEntropy(entropyBits);
    setCrackTime(estimateCrackTime(entropyBits));

    // Bonus for length
    if (pwd.length > 16) score += 10;
    if (pwd.length > 20) score += 10;

    // Determine strength label and color
    let label: string;
    let color: string;
    
    if (score < 30) {
      label = 'Very Weak';
      color = 'bg-destructive';
    } else if (score < 50) {
      label = 'Weak';
      color = 'bg-orange-500';
    } else if (score < 70) {
      label = 'Fair';
      color = 'bg-yellow-500';
    } else if (score < 90) {
      label = 'Strong';
      color = 'bg-blue-500';
    } else {
      label = 'Very Strong';
      color = 'bg-green-500';
    }

    setStrength({ score, label, color, feedback });
    setCriteria(criteriaList);
  };

  useEffect(() => {
    evaluatePassword(password);
  }, [password]);

  const commonPasswords = [
    'P@ssw0rd123',
    'Welcome2024!',
    'Admin@123',
    'Qwerty123!',
    'Summer2024$',
    'MyP@ssw0rd',
  ];

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
              <Shield className="w-5 h-5" />
            </motion.div>
            <span>Password Strength Checker</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type your password here..."
              className="font-mono smooth-transition focus:scale-105"
            />
          </div>

          {/* Strength Indicator */}
          <AnimatePresence>
            {password && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Strength: {strength.label}</span>
                  <span className="text-sm text-muted-foreground">{strength.score}%</span>
                </div>
                <Progress value={strength.score} className={`h-3 ${strength.color}`} />
                
                {/* Entropy Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Entropy</p>
                    <p className="font-medium">{entropy.toFixed(1)} bits</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Time to Crack</p>
                    <p className="font-medium">{crackTime}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Criteria Checklist */}
          <AnimatePresence>
            {criteria.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <h3 className="text-sm font-medium">Password Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {criteria.map((criterion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-2 text-sm"
                    >
                      {criterion.met ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={criterion.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        {criterion.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback */}
          <AnimatePresence>
            {strength.feedback.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-1">Suggestions to improve:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {strength.feedback.map((item, index) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Common Passwords Warning */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Test Common Passwords</h3>
            <div className="flex flex-wrap gap-2">
              {commonPasswords.map((pwd) => (
                <Button
                  key={pwd}
                  variant="outline"
                  size="sm"
                  onClick={() => setPassword(pwd)}
                  className="font-mono text-xs animate-pulse-hover"
                >
                  {pwd}
                </Button>
              ))}
            </div>
          </div>

          {/* Security Tips */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Security Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Use a unique password for each account</li>
                <li>Consider using a password manager</li>
                <li>Enable two-factor authentication when available</li>
                <li>Avoid personal information in passwords</li>
                <li>Use passphrases for better memorability</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}