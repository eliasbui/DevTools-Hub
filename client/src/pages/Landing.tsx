import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Code, Zap, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
          >
            <a href="/api/login">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white animate-pulse-hover"
              >
                Get Started Free
              </Button>
            </a>
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
              title: "40+ Developer Tools",
              description: "JSON formatter, Base64 encoder, UUID generator, regex tester, and many more."
            },
            {
              icon: Shield,
              title: "Privacy First",
              description: "All data processing happens in your browser. Your data never leaves your device."
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <Card className="p-6 smooth-transition hover:shadow-lg">
                <motion.div
                  className="w-12 h-12 text-blue-600 mb-4 animate-float"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <feature.icon className="w-full h-full" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Start free, upgrade when you need more
          </p>
        </div>

        <motion.div 
          className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-6 relative smooth-transition hover:shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Free</h3>
                <div className="text-3xl font-bold mt-2">$0</div>
                <div className="text-gray-500">forever</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">100 operations/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">All basic tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Smart paste detection</span>
                </div>
              </div>
              <a href="/api/login">
                <Button className="w-full animate-pulse-hover">Get Started</Button>
              </a>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-6 relative border-blue-600 shadow-lg smooth-transition hover:shadow-xl">
              <motion.div 
                className="absolute -top-3 left-1/2 -translate-x-1/2"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              </motion.div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Pro</h3>
                <div className="text-3xl font-bold mt-2">$9.99</div>
                <div className="text-gray-500">per month</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Unlimited operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">API history export</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Advanced visualizations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>
              <a href="/api/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 animate-pulse-hover">
                  Get Started
                </Button>
              </a>
            </Card>
          </motion.div>

          {/* Team Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-6 relative smooth-transition hover:shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Team</h3>
                <div className="text-3xl font-bold mt-2">$19.99</div>
                <div className="text-gray-500">per user/month</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Everything in Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Team collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Shared workspaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Admin controls</span>
                </div>
              </div>
              <a href="/api/login">
                <Button className="w-full animate-pulse-hover">Get Started</Button>
              </a>
            </Card>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-6 relative smooth-transition hover:shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Enterprise</h3>
                <div className="text-3xl font-bold mt-2">Custom</div>
                <div className="text-gray-500">contact us</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Everything in Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">SSO/SAML</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Custom integrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Dedicated support</span>
                </div>
              </div>
              <Button className="w-full animate-pulse-hover" variant="outline">
                Contact Sales
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}