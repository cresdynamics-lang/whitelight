import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { siteConfig } from "@/config/site";

export default function StorePage() {
  const wa = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "");
  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
      <SEOHead
        title="Visit The Whitelight | Luthuli Avenue Nairobi CBD"
        description="Rware Building Shop 410, Luthuli Avenue. Map, hours, WhatsApp. Try on running and gym shoes in store."
        canonical="https://whitelightstore.co.ke/store"
      />
      <Header />
      <main className="container py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold text-forest">
              Store & contact
            </h1>
            <p className="mt-3 font-ui">
              {siteConfig.contact.address}
              <br />
              {siteConfig.contact.landmark}
            </p>
            <p className="mt-2 text-sm font-ui text-muted-foreground">
              {siteConfig.hours.label} · {siteConfig.contact.phone}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${wa}`}
                className="h-11 inline-flex items-center rounded-md bg-whatsapp px-5 text-sm font-semibold text-white font-ui"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp
              </a>
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="h-11 inline-flex items-center rounded-md border border-border px-5 text-sm font-semibold font-ui"
              >
                Call
              </a>
              <a
                href={siteConfig.social.instagram}
                className="h-11 inline-flex items-center rounded-md border border-border px-5 text-sm font-semibold font-ui"
                target="_blank"
                rel="noopener noreferrer"
              >
                {siteConfig.social.instagramHandle}
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border aspect-[16/11]">
            <iframe
              title="Map to Whitelight Store"
              src="https://maps.google.com/maps?q=Rware+Building+Luthuli+Avenue+Nairobi&z=16&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
