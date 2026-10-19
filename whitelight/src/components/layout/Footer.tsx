import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook } from "lucide-react";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const footerLinks = [
  { label: "New In", href: "/new" },
  { label: "Sale", href: "/sale" },
  { label: "Size guide", href: "/size-guide" },
  { label: "Delivery & exchanges", href: "/delivery" },
  { label: "Store & contact", href: "/store" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-forest text-white">
      <div className="container py-8 md:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src={siteConfig.logo}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full bg-white object-cover ring-2 ring-white/20"
              />
              <div className="leading-tight">
                <span className="font-heading text-lg font-semibold tracking-wide block">
                  {siteConfig.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-white/70 font-ui">
                  Running · Trail · Training
                </span>
              </div>
            </Link>
            <p className="mt-3 text-sm text-white/75 font-ui leading-relaxed">
              {siteConfig.contact.address}. Same-day CBD · M-Pesa · size help on WhatsApp.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="X"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-white/80 hover:text-white font-ui transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-semibold text-white font-ui hover:opacity-90 shrink-0"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp size help
          </a>
        </div>

        <div className="mt-8 pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-white/55 font-ui">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}.{" "}
            <Link to="/terms" className="underline underline-offset-2 hover:text-white/80">
              Terms
            </Link>
            {" · "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-white/80">
              Privacy
            </Link>
          </p>
          <p>
            Built by{" "}
            <a
              href="https://cresdynamics.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white/80"
            >
              Cres Dynamics
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
