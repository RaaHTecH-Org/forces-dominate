import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Zap, TrendingUp, Users, CheckCircle } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  if (isSubscribed) {
    return (
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card border border-primary/20 rounded-xl p-12 shadow-elevated">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-mono mb-4">
                Welcome to the <span className="text-primary">Force</span>!
              </h2>
              <p className="text-muted-foreground mb-6">
                You're now part of an elite community of 25,000+ successful resellers. 
                Check your inbox for exclusive strategies and early access perks.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>First exclusive email arriving in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-float delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Zap className="w-4 h-4" />
              JOIN THE FORCE
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
              Be the First to <span className="text-primary">Know</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Get exclusive access to elite strategies, market intelligence, 
              and early access to new features. Join 25,000+ successful resellers.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary font-mono">25K+</div>
              <div className="text-sm text-muted-foreground">Elite Members</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-secondary font-mono">$47M+</div>
              <div className="text-sm text-muted-foreground">Revenue Generated</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary font-mono">Weekly</div>
              <div className="text-sm text-muted-foreground">Insider Updates</div>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="bg-card border border-primary/20 rounded-xl p-8 shadow-elevated max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-input border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-smooth"
                />
              </div>
              <Button 
                type="submit" 
                variant="premium" 
                size="lg"
                className="px-8 whitespace-nowrap"
                disabled={!email}
              >
                Join Now
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Exclusive strategies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Early access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Market intel</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                No spam, ever. Unsubscribe anytime with one click. 
                Your email is secured with military-grade encryption.
              </p>
            </div>
          </div>

          {/* What you'll get */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="text-left p-6 bg-card/50 border border-primary/20 rounded-lg">
              <h4 className="font-bold text-foreground mb-2">🎯 Weekly Market Reports</h4>
              <p className="text-sm text-muted-foreground">
                Insider analysis of upcoming drops, market trends, and profit opportunities
              </p>
            </div>
            
            <div className="text-left p-6 bg-card/50 border border-primary/20 rounded-lg">
              <h4 className="font-bold text-foreground mb-2">⚡ Feature Updates</h4>
              <p className="text-sm text-muted-foreground">
                Be the first to know about new bot capabilities and exclusive beta access
              </p>
            </div>
            
            <div className="text-left p-6 bg-card/50 border border-primary/20 rounded-lg">
              <h4 className="font-bold text-foreground mb-2">💎 Elite Strategies</h4>
              <p className="text-sm text-muted-foreground">
                Advanced techniques from our most successful users and internal team
              </p>
            </div>
            
            <div className="text-left p-6 bg-card/50 border border-primary/20 rounded-lg">
              <h4 className="font-bold text-foreground mb-2">🏆 Success Stories</h4>
              <p className="text-sm text-muted-foreground">
                Real case studies and earnings reports from the BlackForces community
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;