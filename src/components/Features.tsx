import { 
  Zap, 
  Shield, 
  Radar, 
  RotateCcw, 
  Target, 
  Eye 
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Auto-Checkout",
      description: "Lightning-fast automated checkout across all major retailers. No human reaction time needed.",
      color: "text-primary"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Stealth Mode",
      description: "Advanced anti-detection systems keep you invisible to retailer security measures.",
      color: "text-secondary"
    },
    {
      icon: <Radar className="w-8 h-8" />,
      title: "Restock Radar",
      description: "Real-time monitoring of inventory across thousands of product pages simultaneously.",
      color: "text-primary"
    },
    {
      icon: <RotateCcw className="w-8 h-8" />,
      title: "Proxy Rotation Engine",
      description: "Intelligent proxy management ensures maximum success rates and minimal detection risk.",
      color: "text-secondary"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Deal Sniping AI",
      description: "Machine learning algorithms predict and target the most profitable drops before competitors.",
      color: "text-primary"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Checkout Cloaking",
      description: "Sophisticated fingerprint masking technology bypasses advanced bot detection systems.",
      color: "text-secondary"
    }
  ];

  return (
    <section id="features" className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            <span className="text-primary">Elite</span> Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Military-grade technology built for the modern reseller. 
            Dominate every drop with precision engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative p-8 bg-card border border-primary/20 rounded-lg hover:border-primary/50 transition-smooth shadow-elevated hover:shadow-neon-green"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-smooth" />
              
              <div className="relative z-10">
                <div className={`${feature.color} mb-4 group-hover:scale-110 transition-smooth`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold font-mono mb-3 text-foreground">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Subtle animation line */}
              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary w-0 group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to level up your game?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-smooth shadow-neon-green">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border border-primary/50 text-primary rounded-lg hover:bg-primary/10 transition-smooth">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;