import { Instagram, Facebook } from "lucide-react";
import { siteConfig } from "@/config/site";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const links = [
  { href: siteConfig.social.instagram, label: "Instagram", Icon: Instagram },
  { href: siteConfig.social.facebook, label: "Facebook", Icon: Facebook },
  { href: siteConfig.social.tiktok, label: "TikTok", Icon: TikTokIcon },
] as const;

/** Vertical social floats — bottom-left on small screens only. */
export function SocialFloat() {
  return (
    <nav
      aria-label="Social media"
      className="fixed bottom-20 left-3 z-40 flex flex-col gap-2 lg:hidden"
    >
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/95 text-forest shadow-md backdrop-blur transition hover:bg-sage"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </nav>
  );
}
