import { Check } from "lucide-react";

interface WhyChooseUsProps {
  imagePath?: string;
}

export function WhyChooseUs({ imagePath = "/placeholder-image.jpg" }: WhyChooseUsProps) {
  const features = [
    {
      title: "Premium Quality",
      description: "Authentic footwear from top global brands"
    },
    {
      title: "Perfect Fit Guarantee", 
      description: "Wide range of sizes to ensure the perfect fit"
    },
    {
      title: "Fast Delivery",
      description: "Quick delivery across Nairobi and Kenya"
    },
    {
      title: "Expert Support",
      description: "Professional advice to help you choose the right shoes"
    },
    {
      title: "Competitive Prices",
      description: "Best prices with regular offers and discounts"
    },
    {
      title: "Free Socks",
      description: "Complimentary premium socks with every purchase"
    }
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Content - Left Side */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Why Choose Us?
              </h2>
              <p className="text-lg text-muted-foreground">
                Experience the difference with WhiteLight Store - your trusted partner for premium footwear in Kenya.
              </p>
            </div>

            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-foreground text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image - Right Side */}
          <div className="relative">
            <div className="w-full aspect-[4/3] overflow-hidden rounded-xl">
              <img
                src={imagePath}
                alt="Why Choose WhiteLight Store"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full -z-10" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/20 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}