import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogIn } from "lucide-react";
import { CartButton } from "@/components/CartButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import sneakerIcon from "@/assets/sneaker-icon.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Blog", href: "#blog" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-primary/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={sneakerIcon} alt="BLACKFORCES" className="w-8 h-8" />
            <span className="text-2xl font-bold font-mono tracking-tight">
              <span className="text-primary">BLACK</span>
              <span className="text-secondary">FORCES</span>
              <span className="text-primary text-xs">™</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-smooth font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Auth Panel */}
          <div className="hidden md:flex items-center gap-4">
            <CartButton />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Full Force Mode</span>
                <Button variant="elite" size="sm" asChild>
                  <Link to="/dashboard">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <Link to="/auth">
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-primary/20">
            <nav className="flex flex-col gap-4 mt-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-smooth font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-primary/20 flex flex-col gap-2">
                <CartButton />
                {user ? (
                  <Button variant="elite" className="w-full" asChild>
                    <Link to="/dashboard">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <Link to="/auth">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;