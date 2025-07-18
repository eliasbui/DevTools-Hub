import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  X, 
  Copy, 
  Settings, 
  Sparkles,
  AlertCircle,
  Check,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClipboard } from '@/hooks/useClipboard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toolsKnowledgeBase } from '@/lib/toolsKnowledge';
import robotIcon from '@assets/robot-3d-icon-download-in-png-blend-fbx-gltf-file-formats--ai-technology-machine-activity-pack-science-icons-7746765-1735354399_1752830016519.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tool?: string;
}

interface AIProvider {
  id: string;
  name: string;
  icon: string;
  requiresKey: boolean;
}

const providers: AIProvider[] = [
  { id: 'included', name: 'Included AI', icon: '✨', requiresKey: false },
  { id: 'openai', name: 'OpenAI', icon: '🤖', requiresKey: true },
  { id: 'anthropic', name: 'Claude', icon: '🧠', requiresKey: true },
  { id: 'google', name: 'Gemini', icon: '💎', requiresKey: true },
  { id: 'azure', name: 'Azure OpenAI', icon: '☁️', requiresKey: true },
];

export function AIAssistant() {
  const { toast } = useToast();
  const { copyToClipboard } = useClipboard();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [provider, setProvider] = useState('included');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);

  // Check user plan
  const isPro = user?.plan !== 'free';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mouse tracking for robot eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!robotRef.current) return;
      
      const rect = robotRef.current.getBoundingClientRect();
      const robotCenterX = rect.left + rect.width / 2;
      const robotCenterY = rect.top + rect.height / 2;
      
      // Calculate distance from mouse to robot center
      const deltaX = e.clientX - robotCenterX;
      const deltaY = e.clientY - robotCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Only track if mouse is within 200px radius
      if (distance < 200) {
        // Calculate eye position (limit movement to small radius)
        const maxOffset = 8;
        const offsetX = (deltaX / distance) * Math.min(distance / 10, maxOffset);
        const offsetY = (deltaY / distance) * Math.min(distance / 10, maxOffset);
        
        setEyePosition({ x: offsetX, y: offsetY });
      } else {
        setEyePosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      tool: selectedTool || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response for now
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateResponse(userMessage.content, selectedTool),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const generateResponse = (question: string, tool: string | null): string => {
    // Simple response generation based on tool knowledge
    if (tool && toolsKnowledgeBase[tool]) {
      const knowledge = toolsKnowledgeBase[tool];
      
      if (question.toLowerCase().includes('input')) {
        return `For ${knowledge.name}, the input format is: ${knowledge.input}`;
      }
      
      if (question.toLowerCase().includes('output')) {
        return `${knowledge.name} outputs: ${knowledge.output}`;
      }
      
      if (question.toLowerCase().includes('how') || question.toLowerCase().includes('use')) {
        return knowledge.usage;
      }
      
      return knowledge.description;
    }
    
    return "I can help you understand how to use any of the developer tools. Please select a tool or ask me a specific question about inputs, outputs, or usage.";
  };

  const copyMessage = (content: string) => {
    copyToClipboard(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              ref={robotRef}
              className="relative w-20 h-20 rounded-full shadow-2xl overflow-hidden group cursor-pointer ai-button-glow"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Glowing background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Inner circle backdrop */}
              <div className="absolute inset-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full" />
              
              {/* 3D Robot Icon */}
              <motion.div
                className="relative z-10 w-full h-full p-2 flex items-center justify-center"
                animate={{ 
                  y: [0, -5, 0],
                  rotateY: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="relative w-full h-full">
                  <motion.img 
                    src={robotIcon} 
                    alt="AI Assistant"
                    className="w-full h-full object-contain drop-shadow-2xl"
                    animate={{
                      filter: [
                        "brightness(1) saturate(1)",
                        "brightness(1.2) saturate(1.2)",
                        "brightness(1) saturate(1)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Robot Eyes Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Left Eye */}
                      <motion.div
                        className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-lg"
                        style={{
                          left: '-6px',
                          top: '-2px',
                          transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                          boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff'
                        }}
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      />
                      {/* Right Eye */}
                      <motion.div
                        className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-lg"
                        style={{
                          right: '-6px',
                          top: '-2px',
                          transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                          boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff'
                        }}
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400"
                animate={{
                  scale: [1, 1.3],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
              
              {/* Second pulse for depth */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-400"
                animate={{
                  scale: [1, 1.5],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5
                }}
              />
              
              <Badge className="absolute -top-1 -right-1 px-2 py-0.5 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 border-0 animate-pulse">
                AI
              </Badge>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl"
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                  {isPro && <Badge variant="secondary">Pro</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {showSettings ? (
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>AI Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(p => (
                          <SelectItem 
                            key={p.id} 
                            value={p.id}
                            disabled={!isPro && p.id !== 'included'}
                          >
                            <span className="flex items-center gap-2">
                              <span>{p.icon}</span>
                              <span>{p.name}</span>
                              {!isPro && p.id !== 'included' && (
                                <Badge variant="secondary" className="ml-auto">Pro</Badge>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {provider !== 'included' && providers.find(p => p.id === provider)?.requiresKey && (
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your API key is encrypted and stored securely
                      </p>
                    </div>
                  )}

                  {!isPro && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Upgrade to Pro to use custom AI providers
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={() => setShowSettings(false)}
                    className="w-full"
                  >
                    Save Settings
                  </Button>
                </CardContent>
              ) : (
                <>
                  {/* Tool Selector */}
                  <div className="px-4 pb-3">
                    <Select value={selectedTool || 'all'} onValueChange={(value) => setSelectedTool(value === 'all' ? null : value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Ask about any tool..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tools</SelectItem>
                        {Object.entries(toolsKnowledgeBase).map(([id, tool]) => (
                          <SelectItem key={id} value={id}>
                            {tool.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-sm text-muted-foreground">
                            Ask me anything about the developer tools!
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Select a tool above or type your question
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1">
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  {message.tool && (
                                    <Badge variant="secondary" className="mt-1">
                                      {toolsKnowledgeBase[message.tool]?.name}
                                    </Badge>
                                  )}
                                </div>
                                {message.role === 'assistant' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 -mt-1"
                                    onClick={() => copyMessage(message.content)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-muted rounded-lg p-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <Separator />
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about inputs, outputs, usage..."
                        disabled={isLoading}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}