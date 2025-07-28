import { useEffect } from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { SEOHead } from "@/components/SEOHead";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import LiveFeed from "@/components/LiveFeed";
import Blog from "@/components/Blog";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  usePageTracking();

  useEffect(() => {
    // Smooth scroll behavior for anchor links
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.href && target.href.includes('#')) {
        e.preventDefault();
        const targetId = target.href.split('#')[1];
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => document.removeEventListener('click', handleSmoothScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="BLACKFORCES™ - Elite Sneaker Bot Network"
        description="Professional sneaker automation tools and bot network. Join thousands of successful sneaker entrepreneurs maximizing their profits with our elite infrastructure."
        keywords="sneaker bot, nike bot, adidas bot, sneaker automation, sneaker reselling, bot network, sneaker software"
      />
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
        <LiveFeed />
        <Blog />
        <FAQ />
        <Contact />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
