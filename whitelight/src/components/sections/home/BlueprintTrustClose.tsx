import { useMemo, useState } from "react";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { siteConfig } from "@/config/site";
import { EU_SIZES, useSizePreference } from "@/context/SizePreferenceContext";

function isOpenNow() {
  const now = new Date();
  const hour = (now.getUTCHours() + 3) % 24;
  const day = now.getUTCDay();
  if (day === 0) return false;
  return hour >= 8 && hour < 19;
}

const COMMUNITY_SHOTS = [
  "/couresel_images/running/running2.webp",
  "/trailshoes.webp",
  "/gymshoes.webp",
  "/couresel_images/basketball/bk1.webp",
  "/couresel_images/running/running3.webp",
];

export function BlueprintHowItWorks() {
  const steps = [
    {
      t: "Pick your pair and size",
      d: "Every size shown is in stock. Photos are of the real pair.",
    },
    {
      t: "Pay your way",
      d: "M-Pesa, card or cash on delivery. The total is shown before you pay.",
    },
    {
      t: "Same-day in the CBD",
      d: `Order before ${siteConfig.delivery.sameDayCutoffHour}:00. Outside Nairobi: courier.`,
    },
    {
      t: "Wrong size? Swap it",
      d: `Exchange within ${siteConfig.delivery.exchangeDays} days, unworn, in the box.`,
    },
  ];

  return (
    <section className="bg-forest text-white py-12 md:py-16">
      <div className="container">
        <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-8">
          From tap to <span className="italic text-sage">your door.</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.t} className="rounded-xl border border-white/15 bg-white/5 p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 font-heading text-lg font-semibold">
                {i + 1}
              </span>
              <p className="mt-3 font-semibold font-ui">{s.t}</p>
              <p className="mt-1 text-sm text-white/70 font-ui">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/15 pt-8">
          <p className="text-sm font-ui text-white/80 mb-4">
            Worn by our customers. Tag{" "}
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline underline-offset-2"
            >
              {siteConfig.social.instagramHandle}
            </a>{" "}
            to be featured.
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {COMMUNITY_SHOTS.map((src, i) => (
              <div
                key={src}
                className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-lg bg-white/10"
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover opacity-90"
                  loading="lazy"
                />
                <span className="sr-only">Customer photo {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BlueprintReviewsFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="border-t border-border bg-card py-12 md:py-16">
      <div className="container grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-3xl font-semibold text-forest">
            What buyers say about fit.
          </h2>
          <p className="mt-3 rounded-lg border border-dashed border-border bg-paper p-5 text-sm text-muted-foreground font-ui">
            Be the first verified buyer to leave a fit note. We never invent reviews — when real
            ones arrive (with consent), they show size, activity, and whether the pair runs small,
            true, or large.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-3xl font-semibold text-forest mb-4">
            Questions, answered honestly.
          </h2>
          <div className="space-y-2">
            {siteConfig.faqs.map((f, i) => (
              <div key={f.q} className="rounded-lg border border-border">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold font-ui"
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  {f.q}
                  <span>{open === i ? "−" : "+"}</span>
                </button>
                {open === i && (
                  <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground font-ui">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BlueprintVisitUs() {
  const open = useMemo(() => isOpenNow(), []);
  const { preferredSize, setPreferredSize } = useSizePreference();
  const [phone, setPhone] = useState("");

  return (
    <section className="container py-12 md:py-16 pb-24 lg:pb-16">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-3xl font-semibold text-forest">
            Come try them on, or we bring them.
          </h2>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-ui">
            <span
              className={`h-2 w-2 rounded-full ${open ? "bg-leaf" : "bg-muted-foreground"}`}
            />
            {open ? "Open now" : "Closed"} · {siteConfig.hours.label}
          </p>
          <p className="mt-4 font-ui text-foreground">
            {siteConfig.contact.address}
            <br />
            {siteConfig.contact.landmark}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://maps.google.com/?q=Rware+Building+Luthuli+Avenue+Nairobi"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 inline-flex items-center rounded-md bg-primary px-5 text-sm font-semibold text-white font-ui"
            >
              Get directions
            </a>
            <NavPrefetchLink
              to="/store"
              className="h-11 inline-flex items-center rounded-md border border-border px-5 text-sm font-semibold font-ui"
            >
              Store details
            </NavPrefetchLink>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-border aspect-[16/10]">
            <iframe
              title="Whitelight Store map"
              src="https://maps.google.com/maps?q=Rware+Building+Luthuli+Avenue+Nairobi&z=16&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-sage/40 p-6">
          <h3 className="font-heading text-2xl font-semibold text-forest">
            New-drop alerts, in your size.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground font-ui">
            One WhatsApp message when your size lands. No spam. Unsubscribe any time.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {EU_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPreferredSize(s)}
                className={`h-9 w-11 rounded-md border text-sm font-semibold font-ui ${
                  preferredSize === s
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="mt-4 flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const wa = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "");
              const text = encodeURIComponent(
                `Hi — please alert me on WhatsApp (${phone}) when size ${preferredSize || "any"} new drops land.`
              );
              window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
            }}
          >
            <input
              required
              type="tel"
              placeholder="WhatsApp number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 flex-1 rounded-md border border-border bg-card px-3 text-sm font-ui"
            />
            <button
              type="submit"
              className="h-11 rounded-md bg-whatsapp px-5 text-sm font-semibold text-white font-ui"
            >
              Alert me
            </button>
          </form>
          <p className="mt-2 text-[11px] text-muted-foreground font-ui">
            By submitting you agree we may message you about stock in your size. Opt out any time.
            Kenya Data Protection Act applies.
          </p>
        </div>
      </div>
    </section>
  );
}
