import type { Express } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  tool?: string;
}

interface AIRequest {
  messages: AIMessage[];
  provider: string;
  apiKey?: string;
  tool?: string;
}

export function registerAIRoutes(app: Express) {
  // Send message to AI
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { messages, provider, apiKey, tool }: AIRequest = req.body;

      // Check if user has access to custom providers
      if (provider !== 'included' && user.plan === 'free') {
        return res.status(403).json({ message: 'Custom AI providers require Pro plan' });
      }

      // For now, return a simple response
      // In production, this would call the actual AI provider APIs
      const response = generateSimpleResponse(messages[messages.length - 1].content, tool);

      res.json({
        content: response,
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      });
    } catch (error) {
      console.error('Error in AI chat:', error);
      res.status(500).json({ message: 'Failed to process AI request' });
    }
  });

  // Get AI usage stats
  app.get('/api/ai/usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // In production, this would fetch real usage stats
      res.json({
        included: {
          used: 50,
          limit: 100,
          resetDate: new Date(Date.now() + 86400000).toISOString()
        },
        custom: {
          used: 0
        }
      });
    } catch (error) {
      console.error('Error fetching AI usage:', error);
      res.status(500).json({ message: 'Failed to fetch AI usage' });
    }
  });

  // Save API key
  app.post('/api/ai/api-key', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { provider, apiKey } = req.body;

      // In production, encrypt and store the API key securely
      // For now, just return success
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving API key:', error);
      res.status(500).json({ message: 'Failed to save API key' });
    }
  });
}

// Simple response generator for demo
function generateSimpleResponse(question: string, tool?: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (tool) {
    if (lowerQuestion.includes('how') || lowerQuestion.includes('use')) {
      return `To use this tool, simply provide the required input in the correct format. The tool will process your data and provide the output in the specified format. Check the tool's interface for specific options and settings.`;
    }
    if (lowerQuestion.includes('input')) {
      return `This tool accepts input in the format shown in the input field. Make sure your data matches the expected format for best results.`;
    }
    if (lowerQuestion.includes('output')) {
      return `The tool will output the processed data in the format selected. You can usually copy the output or download it for further use.`;
    }
  }
  
  const responses = [
    "I can help you understand how to use any of the developer tools. Select a tool from the dropdown or ask me a specific question.",
    "Each tool has specific input and output formats. Let me know which tool you'd like to learn about!",
    "The developer tools hub offers many utilities for data conversion, formatting, and analysis. What would you like to know?",
    "Feel free to ask about tool inputs, outputs, or usage instructions. I'm here to help!",
    "You can select a specific tool from the dropdown to get targeted help, or ask general questions about the platform."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}