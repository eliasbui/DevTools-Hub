import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  Zap, 
  Wand2, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Check,
  Globe,
  Lock,
  Gauge,
  Users,
  Star,
  Code2,
  Database,
  Palette,
  FileText,
  ShieldCheck,
  Layers,
  Bot,
  Rocket,
  ChevronDown
} from 'lucide-react';

export default function Marketing() {
  const { user } = useAuth();

  const features = [
    {
      icon: Wand2,
      title: "Smart Paste Detection",
      description: "Automatically detects and formats JSON, JWT, Base64, URLs, timestamps and more",
      color: "text-purple-500"
    },
    {
      icon: Code2,
      title: "47+ Developer Tools",
      description: "Comprehensive suite of converters, validators, generators, and formatters",
      color: "text-blue-500"
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Intelligent virtual assistant to help you use tools effectively",
      color: "text-green-500"
    },
    {
      icon: Database,
      title: "API Testing Suite",
      description: "Professional HTTP client with environments, history, and cURL generation",
      color: "text-orange-500"
    },
    {
      icon: Shield,
      title: "Security Tools",
      description: "Encryption, certificate analysis, password strength checker, and more",
      color: "text-red-500"
    },
    {
      icon: Gauge,
      title: "Lightning Fast",
      description: "All processing happens locally in your browser - instant results",
      color: "text-yellow-500"
    }
  ];

  const toolCategories = [
    { name: "Data Tools", count: 9, icon: Database },
    { name: "Text Processing", count: 8, icon: FileText },
    { name: "Security & Encryption", count: 5, icon: ShieldCheck },
    { name: "API & Network", count: 1, icon: Globe },
    { name: "CSS & Design", count: 4, icon: Palette },
    { name: "File Processing", count: 5, icon: Layers },
    { name: "Database Tools", count: 5, icon: Database },
    { name: "Generators", count: 6, icon: Sparkles }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for individual developers",
      features: [
        "100 operations per day",
        "Access to all tools",
        "Smart Paste detection",
        "Basic AI assistance",
        "Local processing"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "For professional developers",
      features: [
        "Unlimited operations",
        "API history & persistence",
        "Custom AI providers",
        "Priority support",
        "Advanced features",
        "Export capabilities"
      ],
      cta: "Upgrade to Pro",
      highlighted: true
    },
    {
      name: "Team",
      price: "$19.99",
      period: "/user/month",
      description: "For development teams",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Shared environments",
        "Admin dashboard",
        "API access",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <motion.div 
          className="max-w-6xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Introducing DevTools Hub</span>
          </motion.div>

          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            The Ultimate Developer
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Productivity Platform
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            47+ professional tools in one place. Convert, format, validate, and generate - 
            all with intelligent auto-detection and AI assistance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href={user ? "/" : "/api/login"}>
              <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                {user ? "Open App" : "Start Free"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl">
                Learn More
                <ChevronDown className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>

          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">47+</div>
              <div className="text-sm text-muted-foreground">Developer Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Browser-Based</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0ms</div>
              <div className="text-sm text-muted-foreground">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4" variant="outline">Features</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need,
              <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Nothing You Don't
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by developers, for developers. Every tool is crafted with care to solve real problems.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary/50">
                  <feature.icon className={`w-12 h-12 mb-4 ${feature.color}`} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Categories */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4" variant="outline">Tools</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              A Complete Toolkit
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From simple conversions to complex validations, we've got you covered.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {toolCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="text-center p-6 rounded-xl bg-muted/50 hover:bg-muted transition-all cursor-pointer group"
              >
                <category.icon className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <div className="font-semibold">{category.name}</div>
                <div className="text-2xl font-bold text-primary">{category.count}</div>
                <div className="text-sm text-muted-foreground">tools</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Paste Demo */}
      <section className="px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4" variant="outline">Smart Detection</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Paste Anything,
              <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                We'll Handle It
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our intelligent detection system automatically identifies your data format and suggests the right tools.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-purple-600/10 p-8 border-2 border-primary/20">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Wand2 className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
                  <p className="text-lg text-muted-foreground">
                    Try pasting JSON, JWT tokens, Base64 strings, or any other data
                  </p>
                  <Link href="/">
                    <Button className="mt-4">
                      Try Smart Paste
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4" variant="outline">Pricing</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-8 h-full relative ${
                  plan.highlighted 
                    ? 'border-primary shadow-xl scale-105' 
                    : 'hover:shadow-lg'
                } transition-all`}>
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-br from-primary/10 to-purple-600/10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Supercharge
            <br />
            Your Development Workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who save hours every week with DevTools Hub.
          </p>
          <Link href={user ? "/" : "/api/login"}>
            <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Rocket className="w-5 h-5 mr-2" />
              {user ? "Launch App" : "Get Started Free"}
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2025 DevTools Hub. Built with ❤️ for developers worldwide.</p>
        </div>
      </footer>
    </div>
  );
}