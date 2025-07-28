import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import avatars from "@/assets/avatars.png";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      text: "This bot bagged a PS5 at 2AM. I didn't even blink. BlackForces is different—it's not just fast, it's ruthless.",
      author: "CyberSole47",
      role: "Elite Reseller",
      rating: 5,
      avatar: avatars,
      profit: "$12,500/month"
    },
    {
      text: "BlackForces didn't just checkout—it checked me. Three Jordans in one drop. My competition is still loading the page.",
      author: "GhostCart",
      role: "AIO Veteran",
      rating: 5,
      avatar: avatars,
      profit: "$8,300/month"
    },
    {
      text: "If you see it in the feed, it's already gone. This bot moves faster than my internet connection should allow.",
      author: "ZeroDelay",
      role: "Speed Demon",
      rating: 5,
      avatar: avatars,
      profit: "$15,800/month"
    },
    {
      text: "I went from manual copping fails to automated success overnight. BlackForces turned me from a lurker into a legend.",
      author: "SilentStrike",
      role: "Reformed Manual",
      rating: 5,
      avatar: avatars,
      profit: "$6,900/month"
    },
    {
      text: "The Restock Radar feature is insane. It knows about drops before the retailers do. Pure Black Air Force energy.",
      author: "DataHawk",
      role: "Monitor Expert",
      rating: 5,
      avatar: avatars,
      profit: "$11,200/month"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 bg-card/30 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-float delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            <span className="text-primary">Elite</span> Testimonials
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real feedback from real winners. The BlackForces community doesn't just talk—they deliver results.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-card border border-primary/20 rounded-xl p-8 text-center shadow-elevated hover:shadow-neon-green transition-smooth">
                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-lg md:text-xl text-foreground mb-8 leading-relaxed">
                      "{testimonial.text}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                        <span className="text-primary font-mono font-bold text-sm">
                          {testimonial.author.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-foreground">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        <div className="text-sm text-primary font-mono">{testimonial.profit}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-card border border-primary/30 p-3 rounded-full hover:bg-primary/10 transition-smooth"
          >
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-card border border-primary/30 p-3 rounded-full hover:bg-primary/10 transition-smooth"
          >
            <ChevronRight className="w-6 h-6 text-primary" />
          </button>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-smooth ${
                  index === currentIndex 
                    ? 'bg-primary shadow-neon-green' 
                    : 'bg-muted hover:bg-primary/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary font-mono">4.9/5</div>
            <div className="text-sm text-muted-foreground">User Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary font-mono">50K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary font-mono">2.1M+</div>
            <div className="text-sm text-muted-foreground">Items Copped</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary font-mono">$47M+</div>
            <div className="text-sm text-muted-foreground">Revenue Generated</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;