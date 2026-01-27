import { siteConfig } from "@/config/site";
import { X } from "lucide-react";
import { useState } from "react";

export function PromotionBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!siteConfig.promotions.freeSocks.enabled || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="container flex items-center justify-between py-3 px-4">
        <div className="flex-1 text-center">
          <p className="text-sm font-medium">
            {siteConfig.promotions.freeSocks.text}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 hover:opacity-70 transition-opacity"
          aria-label="Close promotion banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}