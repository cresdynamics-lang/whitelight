import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { siteConfig } from "@/config/site";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
      <SEOHead
        title="Privacy | The Whitelight"
        description="How The Whitelight handles your data under the Kenya Data Protection Act."
        canonical="https://whitelightstore.co.ke/privacy"
      />
      <Header />
      <main className="container max-w-3xl py-10 md:py-14 font-ui text-sm leading-relaxed space-y-4">
        <h1 className="font-heading text-3xl font-semibold text-forest">Privacy notice</h1>
        <p>
          The Whitelight ({siteConfig.contact.address}) collects contact details you share for
          orders, WhatsApp size help, and optional drop alerts. We use them to fulfil orders and
          reply to you — not to spam.
        </p>
        <p>
          WhatsApp alerts are opt-in. You can unsubscribe any time by messaging us. Payment data is
          processed by our payment providers (e.g. M-Pesa / Pesapal); we do not store card numbers
          on this site.
        </p>
        <p>
          We follow the Kenya Data Protection Act. For access or deletion requests, email{" "}
          {siteConfig.contact.email} or WhatsApp {siteConfig.contact.phone}.
        </p>
        <p className="text-muted-foreground">
          Policy wording may be updated by the store’s adviser. Last updated October 2026.
        </p>
      </main>
      <Footer />
    </div>
  );
}
