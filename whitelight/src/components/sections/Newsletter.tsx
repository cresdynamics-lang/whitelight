import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Thanks for subscribing!", {
      description: "You'll receive updates about new arrivals and exclusive offers.",
    });
    
    setEmail("");
    setIsLoading(false);
  };

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container text-center max-w-2xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Stay in the Loop
        </h2>
        <p className="text-primary-foreground/80 mb-8">
          Subscribe to get special offers, new arrivals, and exclusive drops from {siteConfig.name}.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-primary-foreground text-foreground border-0 h-12"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-8"
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
}
