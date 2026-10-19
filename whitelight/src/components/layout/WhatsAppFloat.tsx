import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

const OPEN_MS = 2_000;
const CLOSED_MS = 3 * 60_000;

export function WhatsAppFloat() {
  const phone = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "");
  const text = encodeURIComponent(
    "Hi Whitelight Store — I need size help choosing a pair."
  );
  const href = `https://wa.me/${phone}?text=${text}`;
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    let openTimer: number | undefined;
    let closeTimer: number | undefined;

    const clear = () => {
      if (openTimer) window.clearTimeout(openTimer);
      if (closeTimer) window.clearTimeout(closeTimer);
    };

    const runCycle = () => {
      clear();
      if (!mq.matches) {
        setExpanded(true);
        return;
      }
      setExpanded(true);
      openTimer = window.setTimeout(() => {
        setExpanded(false);
        closeTimer = window.setTimeout(runCycle, CLOSED_MS);
      }, OPEN_MS);
    };

    runCycle();
    const onChange = () => runCycle();
    mq.addEventListener("change", onChange);
    return () => {
      clear();
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-20 right-3 z-40 flex items-center gap-2 rounded-full bg-whatsapp py-1.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:opacity-90 lg:bottom-6 lg:right-6 ${
        expanded ? "pl-1.5 pr-4" : "px-1.5"
      }`}
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
      <span
        className={`overflow-hidden whitespace-nowrap leading-tight transition-all duration-300 ${
          expanded ? "max-w-[11rem] opacity-100" : "max-w-0 opacity-0"
        }`}
      >
        Chat with us
        <span className="block text-[11px] font-medium opacity-90">size help in minutes</span>
      </span>
    </a>
  );
}
