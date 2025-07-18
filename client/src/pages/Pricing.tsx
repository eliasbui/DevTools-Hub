import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, Users, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Pricing() {
  const { user } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      icon: null,
      features: [
        '100 operations per day',
        'All basic tools',
        'Smart paste detection',
        'Client-side processing',
      ],
      buttonText: user?.plan === 'free' ? 'Current Plan' : 'Get Started',
      buttonVariant: 'outline' as const,
      current: user?.plan === 'free',
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      icon: Sparkles,
      popular: true,
      features: [
        'Unlimited operations',
        'API history export',
        'Advanced visualizations',
        'Priority support',
        'No ads',
        'Custom themes',
      ],
      buttonText: user?.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      buttonVariant: 'default' as const,
      current: user?.plan === 'pro',
    },
    {
      name: 'Team',
      price: '$19.99',
      period: 'per user/month',
      icon: Users,
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Shared workspaces',
        'Admin controls',
        'Usage analytics',
        'API access',
      ],
      buttonText: user?.plan === 'team' ? 'Current Plan' : 'Contact Sales',
      buttonVariant: 'outline' as const,
      current: user?.plan === 'team',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      icon: Building,
      features: [
        'Everything in Team',
        'SSO/SAML integration',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'On-premise option',
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline' as const,
      current: user?.plan === 'enterprise',
    },
  ];

  return (
    <Layout 
      title="Pricing Plans"
      description="Choose the perfect plan for your needs"
    >
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${plan.current ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary">
                      Current Plan
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5" />}
                    {plan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-3xl font-bold">{plan.price}</div>
                    <div className="text-sm text-muted-foreground">{plan.period}</div>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.buttonVariant}
                    disabled={plan.current}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Need help choosing?</h3>
            <p className="text-muted-foreground mb-4">
              Our team is here to help you find the perfect plan for your needs
            </p>
            <Button variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}