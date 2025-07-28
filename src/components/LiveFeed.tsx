import { useState, useEffect } from "react";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";

const LiveFeed = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [feedItems, setFeedItems] = useState([
    {
      id: 1,
      product: "PlayStation 5 Digital",
      store: "Best Buy",
      time: "2 min ago",
      user: "CyberSole47",
      price: "$399.99",
      status: "success"
    },
    {
      id: 2,
      product: "Xbox Series X",
      store: "Walmart",
      time: "4 min ago",
      user: "GhostCart",
      price: "$499.99",
      status: "success"
    },
    {
      id: 3,
      product: "Air Jordan 4 Black Cat",
      store: "Nike SNKRS",
      time: "7 min ago",
      user: "ZeroDelay",
      price: "$210.00",
      status: "success"
    },
    {
      id: 4,
      product: "iPhone 15 Pro Max",
      store: "Apple Store",
      time: "12 min ago",
      user: "SilentStrike",
      price: "$1,199.00",
      status: "success"
    },
    {
      id: 5,
      product: "RTX 4090 FE",
      store: "Best Buy",
      time: "18 min ago",
      user: "DataHawk",
      price: "$1,599.99",
      status: "success"
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Occasionally add new items to the feed
      if (Math.random() > 0.85) {
        const newItems = [
          { product: "MacBook Pro M3", store: "Apple Store", user: "TechNinja", price: "$1,999.00" },
          { product: "AirPods Pro 2", store: "Target", user: "AudioPhile", price: "$249.00" },
          { product: "Dunk Low Panda", store: "Nike", user: "SneakerBot", price: "$110.00" },
          { product: "Steam Deck OLED", store: "Steam", user: "GameHunter", price: "$549.00" }
        ];
        
        const randomItem = newItems[Math.floor(Math.random() * newItems.length)];
        const newFeedItem = {
          id: Date.now(),
          ...randomItem,
          time: "Just now",
          status: "success"
        };
        
        setFeedItems(prev => [newFeedItem, ...prev.slice(0, 4)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer for next drop
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 52, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset to new time when reaches 0
          hours = 6;
          minutes = 0;
          seconds = 0;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Live Feed */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <h2 className="text-3xl font-bold font-mono">
                Live <span className="text-primary">Feed</span>
              </h2>
            </div>

            <div className="bg-card border border-primary/20 rounded-xl p-6 shadow-elevated">
              <div className="space-y-4">
                {feedItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border border-primary/10 transition-smooth hover:border-primary/30 ${
                      index === 0 ? 'bg-primary/5 animate-pulse' : 'bg-background/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <div className="font-bold text-sm text-foreground">{item.product}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.store} • {item.user}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono text-sm text-primary">{item.price}</div>
                      <div className="text-xs text-muted-foreground">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-primary/20 text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="text-primary font-mono">247</span> successful checkouts in the last hour
                </div>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-primary">+23% success rate today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-secondary" />
              <h2 className="text-3xl font-bold font-mono">
                Next <span className="text-secondary">Drop</span>
              </h2>
            </div>

            <div className="bg-card border border-secondary/20 rounded-xl p-8 shadow-elevated text-center">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Supreme Box Logo Drop</h3>
                <p className="text-muted-foreground">Thursday 11:00 AM EST</p>
              </div>

              {/* Countdown display */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                  <div className="text-3xl font-bold font-mono text-secondary">
                    {countdown.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                  <div className="text-3xl font-bold font-mono text-secondary">
                    {countdown.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                  <div className="text-3xl font-bold font-mono text-secondary">
                    {countdown.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-secondary text-secondary-foreground font-bold py-3 rounded-lg hover:bg-secondary/90 transition-smooth shadow-neon-purple">
                  Set Reminder
                </button>
                
                <div className="bg-background/50 border border-secondary/20 rounded-lg p-4">
                  <div className="text-sm font-bold text-foreground mb-2">Expected Items:</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Box Logo Hoodies (All Colorways)</div>
                    <div>• Box Logo Tees (Limited Colors)</div>
                    <div>• Accessories Collection</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-card border border-primary/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary font-mono">152</div>
                <div className="text-sm text-muted-foreground">Bots Ready</div>
              </div>
              <div className="bg-card border border-secondary/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-secondary font-mono">98.7%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveFeed;