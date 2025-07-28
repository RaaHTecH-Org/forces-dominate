import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How does BlackForces work?",
      answer: "BlackForces is an advanced all-in-one shopping bot that automates the entire purchasing process. It monitors product pages for restocks, automatically adds items to cart, and completes checkout faster than humanly possible. The bot uses sophisticated anti-detection technology to appear as a regular user to retailer systems."
    },
    {
      question: "Is using shopping bots legal?",
      answer: "Yes, shopping bots operate in a legal gray area and are not illegal. However, they may violate some retailers' terms of service. BlackForces includes advanced stealth features to minimize detection risk. We recommend using residential proxies and following our best practices guide."
    },
    {
      question: "What retailers does BlackForces support?",
      answer: "BlackForces supports all major retailers including Walmart, Amazon, Best Buy, Target, Nike SNKRS, Adidas, Supreme, Shopify stores, and hundreds more. We continuously add support for new sites and update our modules to maintain compatibility."
    },
    {
      question: "How quickly can I set up my bot?",
      answer: "Setup takes less than 5 minutes. After subscribing, you'll receive instant access to our dashboard with step-by-step setup guides. Our Discord community provides 24/7 support to help you get running immediately. Most users complete their first successful checkout within 10 minutes."
    },
    {
      question: "Do I need proxies?",
      answer: "For optimal performance, yes. All BlackForces plans include basic proxies, but we recommend premium residential proxies for maximum success rates. Our Midnight Force and Full Force plans include advanced proxy rotation systems."
    },
    {
      question: "What's your refund policy?",
      answer: "We offer a 7-day money-back guarantee on all plans. If you're not satisfied with BlackForces performance, contact our support team within 7 days for a full refund. No questions asked."
    },
    {
      question: "How much can I expect to make?",
      answer: "Earnings vary based on your strategy, effort, and market conditions. Our users report average monthly profits ranging from $2,000 to $50,000+. Success depends on your dedication, market knowledge, and proper bot utilization. We provide profit optimization guides and community support."
    },
    {
      question: "Do you provide customer support?",
      answer: "Yes! All plans include Discord community access with 24/7 peer support. Midnight Force and Full Force users get priority support channels. Full Force subscribers receive dedicated success managers for personalized assistance."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about BlackForces. Still have questions? 
            Join our Discord community for instant answers.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-card border border-primary/20 rounded-xl overflow-hidden hover:border-primary/40 transition-smooth shadow-elevated"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-primary/5 transition-smooth"
                >
                  <h3 className="text-lg font-bold font-mono text-foreground pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="w-6 h-6 text-primary" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-8 pb-6">
                    <div className="border-t border-primary/10 pt-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-16">
            <div className="bg-card border border-primary/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold font-mono mb-4">
                Still Have <span className="text-primary">Questions</span>?
              </h3>
              <p className="text-muted-foreground mb-6">
                Our elite community is here to help. Join thousands of successful resellers 
                in our Discord server for real-time support and strategies.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-smooth shadow-neon-green">
                  Join Discord Community
                </button>
                <button className="px-8 py-3 border border-primary/50 text-primary rounded-lg hover:bg-primary/10 transition-smooth">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;