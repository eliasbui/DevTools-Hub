import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CopyButton } from '@/components/common/CopyButton';
import { useToast } from '@/hooks/use-toast';
import { Send, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  timestamp: number;
  status?: number;
  duration?: number;
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
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const { toast } = useToast();

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
      // Parse headers
      let parsedHeaders = {};
      try {
        parsedHeaders = headers ? JSON.parse(headers) : {};
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
      };

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body;
      }

      // Make request
      const response = await fetch(url, options);
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

      // Add to history
      const historyItem: RequestHistory = {
        id: Date.now().toString(),
        method,
        url,
        timestamp: Date.now(),
        status: response.status,
        duration: responseTime,
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10

    } catch (error) {
      const responseTime = Date.now() - startTime;
      setResponse(`Error: ${(error as Error).message}`);
      setResponseHeaders('');
      setStatus(null);
      setDuration(responseTime);
      
      toast({
        title: "Request Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item: RequestHistory) => {
    setMethod(item.method);
    setUrl(item.url);
  };

  const generateCurl = () => {
    let curl = `curl -X ${method}`;
    
    // Add headers
    try {
      const parsedHeaders = JSON.parse(headers);
      Object.entries(parsedHeaders).forEach(([key, value]) => {
        curl += ` -H "${key}: ${value}"`;
      });
    } catch (e) {
      // Invalid headers, skip
    }

    // Add body
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      curl += ` -d '${body}'`;
    }

    curl += ` "${url}"`;
    return curl;
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="w-5 h-5 text-primary" />
          <span>HTTP Client & API Testing</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Request Builder */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL..."
                className="flex-1"
              />
              <Button onClick={handleSendRequest} disabled={isLoading}>
                {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </Button>
            </div>

            {/* Request Details */}
            <Tabs defaultValue="headers" className="w-full">
              <TabsList>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="headers" className="space-y-2">
                <label className="text-sm font-medium">Request Headers (JSON)</label>
                <Textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder="Request headers as JSON..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </TabsContent>
              
              <TabsContent value="body" className="space-y-2">
                <label className="text-sm font-medium">Request Body</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Request body..."
                  className="min-h-[120px] font-mono text-sm"
                  disabled={!['POST', 'PUT', 'PATCH'].includes(method)}
                />
              </TabsContent>
              
              <TabsContent value="curl" className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">cURL Command</label>
                  <CopyButton text={generateCurl()} />
                </div>
                <div className="p-3 border rounded-lg bg-muted/50">
                  <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                    {generateCurl()}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Response Section */}
          {(response || isLoading) && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium">Response</h3>
                {status !== null && (
                  <div className={`flex items-center space-x-2 ${getStatusColor(status)}`}>
                    {status >= 200 && status < 300 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="font-medium">{status}</span>
                  </div>
                )}
                {duration !== null && (
                  <span className="text-sm text-muted-foreground">
                    {duration}ms
                  </span>
                )}
              </div>

              <Tabs defaultValue="response" className="w-full">
                <TabsList>
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="response" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Response Body</label>
                    {response && <CopyButton text={response} />}
                  </div>
                  <div className="min-h-[200px] p-4 border rounded-lg bg-muted/50 overflow-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Clock className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                        {response}
                      </pre>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="headers" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Response Headers</label>
                    {responseHeaders && <CopyButton text={responseHeaders} />}
                  </div>
                  <div className="min-h-[200px] p-4 border rounded-lg bg-muted/50 overflow-auto">
                    <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                      {responseHeaders}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Request History</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm font-medium">{item.method}</span>
                      <span className="font-mono text-sm text-muted-foreground">{item.url}</span>
                      {item.status && (
                        <span className={`font-mono text-sm ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.duration && (
                        <span className="text-sm text-muted-foreground">{item.duration}ms</span>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => loadFromHistory(item)}>
                        Load
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}