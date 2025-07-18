import { Badge } from '@/components/ui/badge';
import { DetectedData } from '@/types/tools';

interface DataDetectorProps {
  detected: DetectedData | null;
}

export function DataDetector({ detected }: DataDetectorProps) {
  if (!detected) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'json': return 'bg-blue-500';
      case 'jwt': return 'bg-purple-500';
      case 'base64': return 'bg-green-500';
      case 'url': return 'bg-orange-500';
      case 'timestamp': return 'bg-red-500';
      case 'hex': return 'bg-pink-500';
      case 'xml': return 'bg-yellow-500';
      case 'yaml': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-muted-foreground">Detected:</span>
      <Badge className={`${getTypeColor(detected.type)} text-white`}>
        {detected.type.toUpperCase()}
      </Badge>
      <span className="text-xs text-muted-foreground">
        ({Math.round(detected.confidence * 100)}% confidence)
      </span>
    </div>
  );
}
