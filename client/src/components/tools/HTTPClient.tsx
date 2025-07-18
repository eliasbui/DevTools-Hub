import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CopyButton } from '@/components/common/CopyButton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  History, 
  Download, 
  Upload, 
  Code, 
  Eye, 
  EyeOff, 
  Trash2,
  Save,
  Settings,
  Globe,
  Lock,
  Zap,
  FileText,
  Database,
  X
} from 'lucide-react';

interface RequestHistory {
  id: number;
  method: string;
  url: string;
  headers?: Record<string, any>;
  body?: string;
  responseStatus?: number;
  responseTime?: number;
  createdAt: string;
}

interface TestCase {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: string;
  body: string;
  expectedStatus?: number;
  assertions: string[];
}

interface Environment {
  name: string;
  variables: Record<string, string>;
}

export function HTTPClient() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [responseHeaders, setResponseHeaders] = useState('');
  const [status, setStatus] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('request');
  const [showResponseHeaders, setShowResponseHeaders] = useState(false);
  const [followRedirects, setFollowRedirects] = useState(true);
  const [timeout, setTimeout] = useState(30000);
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment>({
    name: 'Default',
    variables: {}
  });
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([
    { name: 'Default', variables: {} },
    { name: 'Development', variables: { baseUrl: 'http://localhost:3000' } },
    { name: 'Production', variables: { baseUrl: 'https://api.example.com' } }
  ]);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch API history
  const { data: apiHistory = [], refetch: refetchHistory } = useQuery({
    queryKey: ['/api/api-history'],
    enabled: !!user,
  });

  // Save API history mutation
  const saveHistoryMutation = useMutation({
    mutationFn: async (data: Omit<RequestHistory, 'id' | 'createdAt'>) => {
      const response = await apiRequest('POST', '/api/api-history', data);
      return response.json();
    },
    onSuccess: () => {
      refetchHistory();
    },
  });

  // Delete API history mutation
  const deleteHistoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/api-history/${id}`);
    },
    onSuccess: () => {
      refetchHistory();
    },
  });

  // Variable replacement helper
  const replaceVariables = (text: string): string => {
    let result = text;
    Object.entries(currentEnvironment.variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  };

  const handleSendRequest = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Replace variables in URL
      const processedUrl = replaceVariables(url);
      
      // Parse headers
      let parsedHeaders = {};
      try {
        const processedHeaders = replaceVariables(headers);
        parsedHeaders = processedHeaders ? JSON.parse(processedHeaders) : {};
      } catch (e) {
        toast({
          title: "Invalid Headers",
          description: "Headers must be valid JSON",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Prepare request options
      const options: RequestInit = {
        method,
        headers: parsedHeaders,
        redirect: followRedirects ? 'follow' : 'manual',
      };

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = replaceVariables(body);
      }

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      options.signal = controller.signal;

      // Make request
      const response = await fetch(processedUrl, options);
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // Get response headers
      const responseHeadersObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeadersObj[key] = value;
      });

      // Get response body
      const responseBody = await response.text();
      
      // Try to format JSON response
      let formattedResponse = responseBody;
      try {
        const jsonResponse = JSON.parse(responseBody);
        formattedResponse = JSON.stringify(jsonResponse, null, 2);
      } catch (e) {
        // Not JSON, use as-is
      }

      setResponse(formattedResponse);
      setResponseHeaders(JSON.stringify(responseHeadersObj, null, 2));
      setStatus(response.status);
      setDuration(responseTime);

      // Save to history if user is logged in
      if (user) {
        saveHistoryMutation.mutate({
          method,
          url: processedUrl,
          headers: parsedHeaders,
          body: body || undefined,
          responseStatus: response.status,
          responseTime: responseTime,
        });
      }

      // Success toast
      toast({
        title: "Request Successful",
        description: `${method} ${processedUrl} - ${response.status} (${responseTime}ms)`,
      });

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      if (error.name === 'AbortError') {
        setResponse(`Request timed out after ${timeout}ms`);
      } else {
        setResponse(`Error: ${error.message}`);
      }
      setResponseHeaders('');
      setStatus(null);
      setDuration(responseTime);
      
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCurlCommand = () => {
    const processedUrl = replaceVariables(url);
    let curlCommand = `curl -X ${method} "${processedUrl}"`;
    
    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      Object.entries(parsedHeaders).forEach(([key, value]) => {
        curlCommand += ` \\\n  -H "${key}: ${value}"`;
      });
    } catch (e) {
      // Skip headers if invalid
    }
    
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const processedBody = replaceVariables(body);
      curlCommand += ` \\\n  -d '${processedBody}'`;
    }
    
    return curlCommand;
  };

  const loadFromHistory = (historyItem: RequestHistory) => {
    setMethod(historyItem.method);
    setUrl(historyItem.url);
    setHeaders(historyItem.headers ? JSON.stringify(historyItem.headers, null, 2) : '{}');
    setBody(historyItem.body || '');
    setActiveTab('request');
  };

  const createTestCase = () => {
    const testCase: TestCase = {
      id: Date.now().toString(),
      name: `Test ${method} ${url}`,
      method,
      url,
      headers,
      body,
      expectedStatus: status || 200,
      assertions: []
    };
    setTestCases(prev => [...prev, testCase]);
    toast({
      title: "Test Case Created",
      description: `Test case "${testCase.name}" has been created`,
    });
  };

  const getStatusColor = (status: number | null) => {
    if (!status) return 'bg-gray-500';
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-yellow-500';
    if (status >= 400 && status < 500) return 'bg-red-500';
    if (status >= 500) return 'bg-red-600';
    return 'bg-gray-500';
  };

  const getStatusText = (status: number | null) => {
    if (!status) return 'No Response';
    if (status >= 200 && status < 300) return 'Success';
    if (status >= 300 && status < 400) return 'Redirect';
    if (status >= 400 && status < 500) return 'Client Error';
    if (status >= 500) return 'Server Error';
    return 'Unknown';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Send className="w-5 h-5 text-primary" />
              </motion.div>
              <span>API Testing & HTTP Client</span>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={currentEnvironment.name} onValueChange={(value) => {
                const env = environments.find(e => e.name === value);
                if (env) setCurrentEnvironment(env);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {environments.map(env => (
                    <SelectItem key={env.name} value={env.name}>
                      {env.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="space-y-4">
              {/* Request Builder */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                      <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL (use {{baseUrl}} for variables)..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendRequest} disabled={isLoading}>
                    {isLoading ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Headers */}
                  <div className="space-y-2">
                    <Label>Headers (JSON)</Label>
                    <Textarea
                      value={headers}
                      onChange={(e) => setHeaders(e.target.value)}
                      placeholder="Enter headers as JSON..."
                      className="min-h-[150px] md:min-h-[200px] font-mono text-xs"
                    />
                  </div>

                  {/* Body */}
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Enter request body..."
                      className="min-h-[150px] md:min-h-[200px] font-mono text-xs"
                      disabled={!['POST', 'PUT', 'PATCH'].includes(method)}
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(generateCurlCommand());
                    toast({ title: "Copied", description: "cURL command copied to clipboard" });
                  }}>
                    <Code className="w-4 h-4 mr-2" />
                    Copy cURL
                  </Button>
                  <Button size="sm" variant="outline" onClick={createTestCase}>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Test
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setUrl('');
                    setHeaders('{\n  "Content-Type": "application/json"\n}');
                    setBody('');
                    setResponse('');
                    setResponseHeaders('');
                    setStatus(null);
                    setDuration(null);
                  }}>
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="response" className="space-y-4">
              {/* Response Status */}
              {status !== null && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getStatusColor(status)} text-white`}>
                      {status}
                    </Badge>
                    <span className="text-sm font-medium">{getStatusText(status)}</span>
                    {duration && (
                      <span className="text-sm text-muted-foreground">{duration}ms</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowResponseHeaders(!showResponseHeaders)}
                    >
                      {showResponseHeaders ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      Headers
                    </Button>
                    {response && <CopyButton text={response} />}
                  </div>
                </div>
              )}

              {/* Response Headers */}
              <AnimatePresence>
                {showResponseHeaders && responseHeaders && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label>Response Headers</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <pre className="text-xs font-mono text-foreground overflow-auto max-h-32">
                        {responseHeaders}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Response Body */}
              <div className="space-y-2">
                <Label>Response Body</Label>
                <div className="min-h-[300px] p-3 bg-muted rounded-lg border">
                  {response ? (
                    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap overflow-auto">
                      {response}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Send a request to see the response</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Request History</Label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => refetchHistory()}
                  disabled={!user}
                >
                  <History className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              {!user ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Login to save and view request history</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {apiHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No request history yet</p>
                      </div>
                    ) : (
                      apiHistory.map((item: RequestHistory) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="text-xs">
                              {item.method}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.url}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.createdAt).toLocaleString()}
                                {item.responseTime && ` • ${item.responseTime}ms`}
                              </p>
                            </div>
                            {item.responseStatus && (
                              <Badge className={`${getStatusColor(item.responseStatus)} text-white text-xs`}>
                                {item.responseStatus}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => loadFromHistory(item)}
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteHistoryMutation.mutate(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Request Settings</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Follow Redirects</Label>
                    <Switch
                      checked={followRedirects}
                      onCheckedChange={setFollowRedirects}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Timeout (ms)</Label>
                    <Input
                      type="number"
                      value={timeout}
                      onChange={(e) => setTimeout(parseInt(e.target.value) || 30000)}
                      min={1000}
                      max={300000}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Environment Variables</Label>
                  <p className="text-sm text-muted-foreground">
                    Use variables in your requests with {`{{variableName}}`} syntax
                  </p>
                  <div className="space-y-2">
                    {Object.entries(currentEnvironment.variables).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Input value={key} disabled className="w-32" />
                        <Input
                          value={value}
                          onChange={(e) => {
                            const newEnv = { ...currentEnvironment };
                            newEnv.variables[key] = e.target.value;
                            setCurrentEnvironment(newEnv);
                          }}
                          placeholder="Value"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}