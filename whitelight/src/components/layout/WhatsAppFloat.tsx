import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export function WhatsAppFloat() {
  const phone = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "");
  const text = encodeURIComponent(
    "Hi Whitelight Store — I need size help choosing a pair."
  );
  const href = `https://wa.me/${phone}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-3 z-40 flex items-center gap-2 rounded-full bg-whatsapp pl-1.5 pr-4 py-1.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 lg:bottom-6 lg:right-6"
      aria-label="Chat on WhatsApp for size help"
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
        <img
          src={siteConfig.logo}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded-full bg-white object-cover ring-2 ring-white/90"
        />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-whatsapp ring-2 ring-white">
          <WhatsAppIcon className="h-3 w-3 text-white" />
        </span>
      </span>
      <span className="hidden sm:inline leading-tight">
        Chat with us
        <span className="block text-[11px] font-medium opacity-90">size help in minutes</span>
      </span>
      <span className="sm:hidden">Chat</span>
    </a>
  );
}
