import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight } from 'lucide-react';

export default function Marketing() {
  const { user } = useAuth();

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Senior Developer at TechCorp",
      quote: "DevTools Hub has completely transformed my workflow. The Smart Paste feature alone saves me hours every week."
    },
    {
      name: "Sarah Johnson", 
      role: "Full Stack Engineer at StartupXYZ",
      quote: "Someone finally put AI into a dev tools platform in a seamless way. I can't imagine working without it."
    },
    {
      name: "Michael Park",
      role: "DevOps Lead at CloudScale", 
      quote: "Cursor-level productivity gains. DevTools Hub is at least a 2x improvement over using separate tools."
    },
    {
      name: "Emma Wilson",
      role: "Frontend Developer at DesignLab",
      quote: "The API testing suite is better than standalone tools I've paid $50/month for. This is the future."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with gradient */}
      <section className="relative px-4 pt-32 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] to-transparent" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            The AI Developer
            <br />
            Tools Platform
          </motion.h1>

          <motion.p 
            className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Built to make you extraordinarily productive,
            <br />
            DevTools Hub is the best way to work with data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href={user ? "/" : "/api/login"}>
              <Button size="lg" className="text-lg px-8 h-14 rounded-lg font-medium">
                {user ? "Open DevTools Hub" : "Download for Free"}
              </Button>
            </Link>
          </motion.div>

          {/* Company logos */}
          <motion.div 
            className="flex flex-wrap gap-x-12 gap-y-4 justify-center mt-24 text-sm text-muted-foreground items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className="opacity-60">Trusted by engineers at</span>
            <span className="font-semibold opacity-60">Samsung</span>
            <span className="font-semibold opacity-60">Stripe</span>
            <span className="font-semibold opacity-60">OpenAI</span>
            <span className="font-semibold opacity-60">Perplexity</span>
            <span className="font-semibold opacity-60">Shopify</span>
          </motion.div>
        </div>
      </section>

      {/* Product showcase - minimal app preview */}
      <section className="relative px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="aspect-[16/9] bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
              <div className="text-center p-12">
                <div className="text-6xl mb-4">🛠️</div>
                <p className="text-xl text-muted-foreground">47+ Developer Tools</p>
                <p className="text-sm text-muted-foreground mt-2">Smart detection • AI assistance • Instant results</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - text-only sections */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-32">
          {/* Feature 1 */}
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Paste, paste, paste
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              DevTools Hub lets you breeze through data conversions by automatically
              detecting and formatting your content. Just paste and go.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Knows your tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant help from our AI assistant. Ask questions, learn shortcuts,
              and discover the most efficient way to use each tool.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Work in natural language
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tell the AI what you want to achieve. Convert, format, validate,
              or generate data using simple instructions.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">
            Build software faster
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Intelligent, fast, and familiar, DevTools Hub is the best way to work with data.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-muted/50 rounded-lg p-8 h-full">
                <h3 className="text-xl font-semibold mb-4">Frontier Intelligence</h3>
                <p className="text-muted-foreground">
                  Powered by cutting-edge AI models, DevTools Hub understands your intent and delivers exactly what you need.
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-muted/50 rounded-lg p-8 h-full">
                <h3 className="text-xl font-semibold mb-4">Feels Familiar</h3>
                <p className="text-muted-foreground">
                  Import your workflow preferences, use keyboard shortcuts, and work the way you're comfortable.
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-muted/50 rounded-lg p-8 h-full">
                <h3 className="text-xl font-semibold mb-4">Privacy First</h3>
                <p className="text-muted-foreground">
                  All processing happens locally in your browser. Your data never leaves your machine without consent.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href={user ? "/" : "/api/login"}>
              <Button variant="outline" size="lg">
                See all features
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">
            Loved by world-class devs
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Engineers all around the world reach for DevTools Hub by choice.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-muted/30 rounded-lg p-8"
              >
                <p className="text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="px-4 py-32 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">
            Ready to 10x your productivity?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join thousands of developers using DevTools Hub every day.
          </p>
          <Link href={user ? "/" : "/api/login"}>
            <Button size="lg" className="text-lg px-8 h-14 rounded-lg">
              {user ? "Launch DevTools Hub" : "Get Started Free"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-sm text-muted-foreground">
          <p>© 2025 DevTools Hub</p>
          <div className="flex gap-8">
            <Link href="/pricing">Pricing</Link>
            <Link href="/features">Features</Link>
            <Link href="/docs">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}