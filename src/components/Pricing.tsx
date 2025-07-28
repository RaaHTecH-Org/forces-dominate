import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "LITE FORCE",
      price: 29,
      icon: <Zap className="w-6 h-6" />,
      description: "Perfect for beginners getting their first taste of bot power",
      features: [
        "Basic auto-checkout",
        "5 concurrent tasks",
        "Discord support",
        "Basic proxies included",
        "Walmart & Target support",
        "Mobile app access"
      ],
      color: "border-muted",
      bgColor: "bg-card",
      popular: false
    },
    {
      name: "MIDNIGHT FORCE",
      price: 59,
      icon: <Crown className="w-6 h-6" />,
      description: "The perfect balance of power and affordability",
      features: [
        "Advanced auto-checkout",
        "15 concurrent tasks",
        "Restock monitoring",
        "Premium proxy rotation",
        "All major retailers",
        "Priority Discord support",
        "Custom profiles",
        "Success analytics"
      ],
      color: "border-primary",
      bgColor: "bg-primary/5",
      popular: true
    },
    {
      name: "FULL FORCE MODE",
      price: 99,
      icon: <Rocket className="w-6 h-6" />,
      description: "Unleash maximum power with unlimited access",
      features: [
        "Elite auto-checkout",
        "Unlimited concurrent tasks",
        "AI-powered deal sniping",
        "Enterprise proxy network",
        "All retailers + exclusive drops",
        "24/7 priority support",
        "Advanced analytics",
        "Custom integrations",
        "Early access features",
        "Personal success manager"
      ],
      color: "border-secondary",
      bgColor: "bg-secondary/5",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            Choose Your <span className="text-primary">Force</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Monthly subscriptions designed to scale with your hustle. 
            Cancel anytime, but you won't want to.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>All plans include 7-day money-back guarantee</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-xl border-2 ${plan.color} ${plan.bgColor} hover:scale-105 transition-smooth shadow-elevated ${plan.popular ? 'shadow-neon-green' : ''}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'} mb-4`}>
                  {plan.icon}
                </div>
                
                <h3 className="text-2xl font-bold font-mono mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold font-mono">${plan.price}</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? "premium" : "elite"} 
                size="lg" 
                className="w-full font-bold"
              >
                Subscribe Now
              </Button>

              {plan.popular && (
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Start your 7-day free trial today
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom info */}
        <div className="text-center mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold mb-2">No Setup Fees</h4>
              <p className="text-sm text-muted-foreground">Start immediately with zero upfront costs</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold mb-2">Instant Activation</h4>
              <p className="text-sm text-muted-foreground">Get your bot running in under 5 minutes</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold mb-2">Elite Support</h4>
              <p className="text-sm text-muted-foreground">24/7 Discord community and expert help</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;