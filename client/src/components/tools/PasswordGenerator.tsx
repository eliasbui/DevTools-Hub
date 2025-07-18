import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { CopyButton } from '@/components/common/CopyButton';
import { useToast } from '@/hooks/use-toast';
import { Shield, RefreshCw } from 'lucide-react';

export function PasswordGenerator() {
  const [length, setLength] = useState([12]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const { toast } = useToast();

  const generatePassword = () => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }

    if (!charset) {
      toast({
        title: "Configuration Error",
        description: "Please select at least one character type",
        variant: "destructive",
      });
      return;
    }

    const newPasswords = [];
    for (let i = 0; i < count; i++) {
      let password = '';
      for (let j = 0; j < length[0]; j++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      newPasswords.push(password);
    }
    setPasswords(newPasswords);
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) score += 20;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 10;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score += 10;
    else feedback.push('Include numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    else feedback.push('Include special characters');

    // Patterns check
    if (!/(.)\1{2,}/.test(password)) score += 10;
    else feedback.push('Avoid repeated characters');

    const strength = Math.min(score, 100);
    let level = 'Very Weak';
    if (strength >= 80) level = 'Very Strong';
    else if (strength >= 60) level = 'Strong';
    else if (strength >= 40) level = 'Moderate';
    else if (strength >= 20) level = 'Weak';

    return { score: strength, level, feedback };
  };

  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-blue-600';
    if (score >= 40) return 'bg-yellow-600';
    if (score >= 20) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const generatePronounceablePassword = () => {
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    let password = '';
    const syllables = Math.floor(length[0] / 2);
    
    for (let i = 0; i < syllables; i++) {
      password += consonants[Math.floor(Math.random() * consonants.length)];
      password += vowels[Math.floor(Math.random() * vowels.length)];
    }
    
    // Add complexity
    if (includeNumbers) {
      password += numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (includeSymbols) {
      password += symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    // Capitalize first letter
    if (includeUppercase) {
      password = password.charAt(0).toUpperCase() + password.slice(1);
    }
    
    // Pad to desired length
    while (password.length < length[0]) {
      password += consonants[Math.floor(Math.random() * consonants.length)];
    }
    
    setPasswords([password.slice(0, length[0])]);
  };

  const passphraseWords = [
    'apple', 'banana', 'cherry', 'dragon', 'elephant', 'forest', 'guitar', 'hammer',
    'island', 'jungle', 'keyboard', 'laptop', 'mountain', 'notebook', 'ocean', 'piano',
    'question', 'rainbow', 'sunset', 'thunder', 'umbrella', 'village', 'window', 'xylophone',
    'yellow', 'zebra', 'bridge', 'castle', 'flower', 'garden', 'house', 'light',
    'magic', 'river', 'star', 'tree', 'water', 'cloud', 'moon', 'fire'
  ];

  const generatePassphrase = () => {
    const wordCount = Math.max(3, Math.floor(length[0] / 6));
    const selectedWords = [];
    
    for (let i = 0; i < wordCount; i++) {
      const word = passphraseWords[Math.floor(Math.random() * passphraseWords.length)];
      selectedWords.push(word);
    }
    
    let passphrase = selectedWords.join('-');
    
    if (includeNumbers) {
      passphrase += Math.floor(Math.random() * 100);
    }
    if (includeSymbols) {
      passphrase += '!';
    }
    
    setPasswords([passphrase]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <span>Password Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Configuration */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Length: {length[0]} characters</label>
                <Slider
                  value={length}
                  onValueChange={setLength}
                  min={4}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Generate</label>
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="50"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uppercase"
                  checked={includeUppercase}
                  onCheckedChange={setIncludeUppercase}
                />
                <label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowercase"
                  checked={includeLowercase}
                  onCheckedChange={setIncludeLowercase}
                />
                <label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={includeNumbers}
                  onCheckedChange={setIncludeNumbers}
                />
                <label htmlFor="numbers" className="text-sm">Numbers (0-9)</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="symbols"
                  checked={includeSymbols}
                  onCheckedChange={setIncludeSymbols}
                />
                <label htmlFor="symbols" className="text-sm">Symbols (!@#$)</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exclude-similar"
                  checked={excludeSimilar}
                  onCheckedChange={setExcludeSimilar}
                />
                <label htmlFor="exclude-similar" className="text-sm">Exclude Similar</label>
              </div>
            </div>
          </div>

          {/* Generation Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={generatePassword}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Random
            </Button>
            <Button onClick={generatePronounceablePassword} variant="outline">
              Pronounceable
            </Button>
            <Button onClick={generatePassphrase} variant="outline">
              Passphrase
            </Button>
          </div>

          {/* Generated Passwords */}
          {passwords.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generated Passwords</h3>
              <div className="space-y-3">
                {passwords.map((password, index) => {
                  const strength = calculatePasswordStrength(password);
                  return (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm break-all">{password}</span>
                        <CopyButton text={password} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Strength</span>
                          <span className={`text-sm font-medium ${getStrengthColor(strength.score)}`}>
                            {strength.level}
                          </span>
                        </div>
                        <Progress value={strength.score} className="h-2" />
                        
                        {strength.feedback.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <p className="font-medium">Suggestions:</p>
                            <ul className="list-disc list-inside">
                              {strength.feedback.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Password Security Tips */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Password Security Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Length Matters</h4>
                <p className="text-muted-foreground">Longer passwords are exponentially harder to crack. Aim for at least 12 characters.</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Use Unique Passwords</h4>
                <p className="text-muted-foreground">Never reuse passwords across different accounts. Use a password manager.</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Mix Character Types</h4>
                <p className="text-muted-foreground">Combine uppercase, lowercase, numbers, and symbols for maximum security.</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Avoid Personal Info</h4>
                <p className="text-muted-foreground">Don't use names, birthdays, or other personal information in passwords.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}