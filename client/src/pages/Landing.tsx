import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Code, Zap, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl font-bold text-gray-900 dark:text-gray-50 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Developer Tools Hub
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The ultimate collection of tools for developers. Smart paste detection, data converters, and more.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.location.href = '/api/login'}
            >
              Login with Replit
            </Button>
            <Link href="/signup">
              <Button 
                size="lg" 
                variant="outline"
              >
                Sign Up with Email
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            {
              icon: Zap,
              title: "Smart Paste Detection",
              description: "Automatically detect and format JSON, JWT, Base64, URLs, timestamps, and more."
            },
            {
              icon: Code,
              title: "47+ Developer Tools",
              description: "Comprehensive collection of converters, generators, validators, and utilities."
            },
            {
              icon: Shield,
              title: "Privacy First",
              description: "All processing happens in your browser. Your data never leaves your device."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className={`w-12 h-12 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-blue-500' : 'text-green-500'} mb-4`} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Assistant Feature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">AI-Powered Assistant</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get instant help with any tool. Our AI assistant understands your needs and guides you to the right solution.
            </p>
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started with AI Assistant
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}