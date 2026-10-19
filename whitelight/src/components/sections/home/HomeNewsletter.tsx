import { useState } from "react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";

interface HomeNewsletterProps {
  title?: string;
  subtext?: string;
}

export function HomeNewsletter({
  title = "Stay ahead of the drop.",
  subtext = "Be first to hear about new arrivals, restocks and selected offers from Whitelight.",
}: HomeNewsletterProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Thanks for subscribing!", {
      description: "You'll receive updates about new arrivals and exclusive offers.",
    });
    setEmail("");
    setIsLoading(false);
  };

  return (
    <section className="wh-newsletter">
      <div className="wh-shell">
        <div className="wh-newsletter__inner">
          <div className="wh-newsletter__copy">
            <h2>{title}</h2>
            <p>{subtext}</p>
          </div>
          <form className="wh-newsletter__form" onSubmit={handleSubmit}>
            <div className="wh-newsletter__field">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address"
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Signing up..." : "Sign up"}
              </button>
            </div>
            <label className="wh-newsletter__consent">
              <input type="checkbox" required />
              <span>
                I agree to receive {siteConfig.name} marketing emails. Unsubscribe anytime.
              </span>
            </label>
          </form>
        </div>
      </div>
    </section>
  );
}
