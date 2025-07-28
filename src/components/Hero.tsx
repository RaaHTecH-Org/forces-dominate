import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Zap, Target } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const [glitchText, setGlitchText] = useState("BLACKFORCES™");

  useEffect(() => {
    const interval = setInterval(() => {
      const glitched = Math.random() > 0.7;
      if (glitched) {
        setGlitchText("BL4CKF0RC3S™");
        setTimeout(() => setGlitchText("BLACKFORCES™"), 150);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px]" />
      
      {/* Animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-secondary rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main heading with glitch effect */}
          <h1 className="text-6xl md:text-8xl font-bold font-mono mb-6 relative">
            <span 
              className="glitch-text text-primary"
              data-text={glitchText}
            >
              {glitchText}
            </span>
          </h1>

          {/* Tagline */}
          <div className="mb-8">
            <p className="text-2xl md:text-3xl font-bold text-primary mb-2 font-mono">
              "If you're not first, you're not laced."
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The premium all-in-one shopping bot designed to dominate online restocks, 
              retail drops, and flash sales across major retailers.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary font-mono">99.7%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary font-mono">2.3s</div>
              <div className="text-sm text-muted-foreground">Avg Checkout</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary font-mono">50K+</div>
              <div className="text-sm text-muted-foreground">Successful Cops</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="force" 
              size="xl"
              className="group animate-pulse-glow"
            >
              <Zap className="w-5 h-5" />
              Lace Up & Cop
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="elite" size="xl">
              <Target className="w-5 h-5" />
              View Pricing
            </Button>
          </div>

          {/* Live indicator */}
          <div className="mt-12 flex items-center justify-center gap-2 text-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-muted-foreground">
              <span className="text-primary font-mono">247</span> bots active • 
              <span className="text-secondary font-mono">Next drop in 04:52:19</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;