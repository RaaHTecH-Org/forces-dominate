import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Mail, Clock, CheckCircle } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card border border-primary/20 rounded-xl p-12 shadow-elevated">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-mono mb-4">
                Message <span className="text-primary">Sent</span>!
              </h2>
              <p className="text-muted-foreground mb-6">
                Thanks for reaching out. Our team will get back to you within 24 hours. 
                For urgent matters, join our Discord for immediate assistance.
              </p>
              <Button variant="elite" onClick={() => setIsSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Need help getting started? Have a custom request? 
            Our team is here to help you dominate the market.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Form */}
          <div className="bg-card border border-primary/20 rounded-xl p-8 shadow-elevated">
            <h3 className="text-2xl font-bold font-mono mb-6">Send us a message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-input border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-smooth"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-input border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-smooth"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-input border border-primary/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-smooth"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="custom">Custom Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-input border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-smooth resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <Button 
                type="submit" 
                variant="premium" 
                size="lg" 
                className="w-full"
                disabled={!formData.name || !formData.email || !formData.subject || !formData.message}
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info & Quick Links */}
          <div className="space-y-8">
            
            {/* Contact Methods */}
            <div className="bg-card border border-primary/20 rounded-xl p-8 shadow-elevated">
              <h3 className="text-2xl font-bold font-mono mb-6">Other ways to reach us</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Discord Community</h4>
                    <p className="text-muted-foreground text-sm mb-2">
                      Join 50,000+ users for instant support and real-time discussions
                    </p>
                    <button className="text-primary hover:text-primary/80 text-sm font-medium">
                      Join Discord →
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Email Support</h4>
                    <p className="text-muted-foreground text-sm mb-2">
                      For detailed inquiries and account-specific issues
                    </p>
                    <a href="mailto:support@blackforces.com" className="text-secondary hover:text-secondary/80 text-sm font-medium">
                      support@blackforces.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Response Times</h4>
                    <div className="text-muted-foreground text-sm space-y-1">
                      <div>Discord: <span className="text-primary">Instant</span></div>
                      <div>Email: <span className="text-primary">Within 24 hours</span></div>
                      <div>Priority Support: <span className="text-primary">Within 2 hours</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-primary/20 rounded-xl p-8 shadow-elevated">
              <h3 className="text-2xl font-bold font-mono mb-6">Quick Actions</h3>
              
              <div className="space-y-4">
                <Button variant="elite" className="w-full justify-start">
                  <MessageCircle className="w-5 h-5 mr-3" />
                  Join Discord Community
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Send className="w-5 h-5 mr-3" />
                  Request Demo
                </Button>
                
                <Button variant="ghost" className="w-full justify-start">
                  <Mail className="w-5 h-5 mr-3" />
                  Partnership Inquiry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;