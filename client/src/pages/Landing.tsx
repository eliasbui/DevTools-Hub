import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Code, Zap, Shield, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-50 mb-6">
            Developer Tools Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            The ultimate collection of tools for developers. Smart paste detection, data converters, and more.
          </p>
          <a href="/api/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started Free
            </Button>
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Paste Detection</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Automatically detect and format JSON, JWT, Base64, URLs, timestamps, and more.
            </p>
          </Card>
          <Card className="p-6">
            <Code className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">40+ Developer Tools</h3>
            <p className="text-gray-600 dark:text-gray-400">
              JSON formatter, Base64 encoder, UUID generator, regex tester, and many more.
            </p>
          </Card>
          <Card className="p-6">
            <Shield className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600 dark:text-gray-400">
              All data processing happens in your browser. Your data never leaves your device.
            </p>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="p-6 relative">
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
              <Button className="w-full">Get Started</Button>
            </a>
          </Card>

          {/* Pro Plan */}
          <Card className="p-6 relative border-blue-600 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Most Popular
              </span>
            </div>
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
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </a>
          </Card>

          {/* Team Plan */}
          <Card className="p-6 relative">
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
              <Button className="w-full">Get Started</Button>
            </a>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-6 relative">
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
            <Button className="w-full" variant="outline">
              Contact Sales
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}