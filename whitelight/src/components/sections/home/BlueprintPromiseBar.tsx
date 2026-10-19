import { siteConfig } from "@/config/site";

const promises = [
  { title: "Same-day CBD delivery", body: `Order before ${siteConfig.delivery.sameDayCutoffHour}:00` },
  { title: "Pay with M-Pesa", body: "Or card, or on delivery" },
  { title: "Easy size exchange", body: `Within ${siteConfig.delivery.exchangeDays} days, unworn` },
  { title: "Photos of the real pair", body: "Every angle, in stock" },
  { title: "Size help on WhatsApp", body: "Replies in minutes" },
];

export function BlueprintPromiseBar() {
  const brands = [...siteConfig.brands, ...siteConfig.brands];

  return (
    <section className="border-b border-border bg-card">
      <div className="overflow-hidden border-b border-border/60 py-3">
        <div className="flex w-max animate-[wl-marquee_28s_linear_infinite] gap-10 px-4">
          {brands.map((b, i) => (
            <span
              key={`${b}-${i}`}
              className="shrink-0 font-heading text-lg font-semibold tracking-[0.12em] uppercase text-forest/55"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
      <div className="container py-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {promises.map((p) => (
            <div key={p.title} className="rounded-lg bg-sage/50 px-3 py-3">
              <p className="text-sm font-semibold text-forest font-ui">{p.title}</p>
              <p className="text-xs text-muted-foreground font-ui mt-0.5">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
