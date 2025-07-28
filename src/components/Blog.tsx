import { ArrowRight, Calendar, User, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import blogThumb1 from "@/assets/blog-thumb-1.jpg";
import blogThumb2 from "@/assets/blog-thumb-2.jpg";
import blogThumb3 from "@/assets/blog-thumb-3.jpg";

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: "Why You're Losing Flash Sales",
      excerpt: "The harsh truth about manual copping in 2024. Here's why human reflexes can't compete with modern bot technology.",
      image: blogThumb1,
      author: "BlackForces Team",
      date: "Jan 15, 2024",
      readTime: "5 min read",
      category: "Strategy",
      featured: true
    },
    {
      id: 2,
      title: "The Rise of AIO Bots in 2025",
      excerpt: "From simple autocheckout scripts to AI-powered shopping assistants. The evolution continues.",
      image: blogThumb2,
      author: "TechAnalyst",
      date: "Jan 12, 2024",
      readTime: "8 min read",
      category: "Technology",
      featured: false
    },
    {
      id: 3,
      title: "Black Air Force Energy Explained",
      excerpt: "The cultural phenomenon behind the mindset. Why BlackForces embodies the ultimate hustle mentality.",
      image: blogThumb3,
      author: "CultureWriter",
      date: "Jan 10, 2024",
      readTime: "6 min read",
      category: "Culture",
      featured: false
    }
  ];

  return (
    <section id="blog" className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            Latest <span className="text-primary">Intel</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay ahead of the game with insider knowledge, bot strategies, and market insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {posts.map((post, index) => (
            <article 
              key={post.id}
              className={`group relative rounded-xl overflow-hidden border border-primary/20 hover:border-primary/50 transition-smooth shadow-elevated hover:shadow-neon-green ${
                post.featured && index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                    post.featured && index === 0 ? 'h-64 lg:h-80' : 'h-48'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    {post.category}
                  </span>
                </div>

                {/* Featured badge */}
                {post.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      FEATURED
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className={`font-bold font-mono text-foreground mb-3 group-hover:text-primary transition-smooth ${
                  post.featured && index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'
                }`}>
                  {post.title}
                </h3>

                <p className={`text-muted-foreground leading-relaxed mb-6 ${
                  post.featured && index === 0 ? 'text-base lg:text-lg' : 'text-sm'
                }`}>
                  {post.excerpt}
                </p>

                <Button 
                  variant="ghost" 
                  className="group/btn p-0 h-auto font-bold text-primary hover:text-primary"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-card border border-primary/20 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold font-mono mb-4">
              Want More <span className="text-primary">Elite</span> Content?
            </h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for exclusive strategies, early access to features, and insider market intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-input border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button variant="premium" className="px-8">
                Subscribe
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Join 25,000+ elite resellers. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;