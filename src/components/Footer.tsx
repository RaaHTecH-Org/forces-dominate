import { 
  Twitter, 
  MessageCircle, 
  Instagram, 
  Mail, 
  Shield, 
  FileText,
  ExternalLink
} from "lucide-react";
import sneakerIcon from "@/assets/sneaker-icon.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Demo", href: "#demo" },
      { name: "API", href: "#api" }
    ],
    support: [
      { name: "Discord Community", href: "#discord" },
      { name: "Documentation", href: "#docs" },
      { name: "Tutorials", href: "#tutorials" },
      { name: "Status", href: "#status" }
    ],
    company: [
      { name: "About", href: "#about" },
      { name: "Blog", href: "#blog" },
      { name: "Careers", href: "#careers" },
      { name: "Contact", href: "#contact" }
    ],
    legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Refund Policy", href: "#refunds" },
      { name: "DMCA", href: "#dmca" }
    ]
  };

  const socialLinks = [
    {
      name: "Twitter",
      href: "https://twitter.com/blackforces",
      icon: <Twitter className="w-5 h-5" />
    },
    {
      name: "Discord",
      href: "https://discord.gg/blackforces",
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      name: "Instagram",
      href: "https://instagram.com/blackforces",
      icon: <Instagram className="w-5 h-5" />
    }
  ];

  return (
    <footer className="bg-card border-t border-primary/20 pt-16 pb-8">
      <div className="container mx-auto px-4">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src={sneakerIcon} alt="BLACKFORCES" className="w-8 h-8" />
              <span className="text-2xl font-bold font-mono tracking-tight">
                <span className="text-primary">BLACK</span>
                <span className="text-secondary">FORCES</span>
                <span className="text-primary text-xs">™</span>
              </span>
            </div>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The premium all-in-one shopping bot designed to dominate online restocks, 
              retail drops, and flash sales. Built with Black Air Force Energy.
            </p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Trusted by 50,000+ resellers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-muted-foreground">99.7% uptime guaranteed</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4 font-mono">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-smooth text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4 font-mono">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-smooth text-sm flex items-center gap-1"
                  >
                    {link.name}
                    {link.name === "Discord Community" && <ExternalLink className="w-3 h-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4 font-mono">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-smooth text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4 font-mono">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-smooth text-sm flex items-center gap-1"
                  >
                    {link.name === "Privacy Policy" && <FileText className="w-3 h-3" />}
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-foreground mb-1 font-mono">
                Stay ahead of the competition
              </h3>
              <p className="text-muted-foreground text-sm">
                Get exclusive strategies and early access to new features
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-input border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-smooth text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-primary/20">
          
          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} BLACKFORCES™. All rights reserved. 
            <span className="ml-2 text-primary font-mono">"If you're not first, you're not laced."</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground mr-2">Follow us:</span>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition-smooth p-2 hover:bg-primary/10 rounded-lg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Final tagline */}
        <div className="text-center mt-8 pt-6 border-t border-primary/20">
          <p className="text-xs text-muted-foreground font-mono">
            Built different. Built to dominate. Built with{" "}
            <span className="text-primary">Black Air Force Energy</span>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;