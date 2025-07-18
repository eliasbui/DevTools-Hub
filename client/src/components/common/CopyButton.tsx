import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function CopyButton({ text, variant = 'outline', size = 'sm', className }: CopyButtonProps) {
  const { copy, isLoading } = useClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={isLoading}
      className={className}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {size !== 'sm' && <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>}
    </Button>
  );
}
