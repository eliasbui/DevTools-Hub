export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  component: React.ComponentType;
}

export interface DetectedData {
  type: 'json' | 'base64' | 'jwt' | 'url' | 'timestamp' | 'hex' | 'xml' | 'yaml' | 'text';
  confidence: number;
  data: any;
  formatted?: string;
}

export interface HistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: number;
  input: string;
  output: string;
  type: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  recentTools: string[];
  history: HistoryItem[];
}
