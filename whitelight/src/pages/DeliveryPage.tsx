import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { siteConfig } from "@/config/site";

export default function DeliveryPage() {
  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
      <SEOHead
        title="Delivery & Exchanges Nairobi | The Whitelight"
        description="Same-day CBD delivery, courier elsewhere, and our 3-day size exchange rule."
        canonical="https://whitelightstore.co.ke/delivery"
      />
      <Header />
      <main className="container max-w-3xl py-10 md:py-14">
        <h1 className="font-heading text-3xl md:text-4xl font-semibold text-forest">
          Delivery & exchanges
        </h1>
        <div className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm font-ui">
            <thead className="bg-sage/50">
              <tr>
                {["Area", "Time", "Notes"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Nairobi CBD</td>
                <td className="px-3 py-2">Same day</td>
                <td className="px-3 py-2">
                  Order before {siteConfig.delivery.sameDayCutoffHour}:00 · fee confirmed on WhatsApp
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Greater Nairobi</td>
                <td className="px-3 py-2">Same / next day</td>
                <td className="px-3 py-2">Courier · parcel charges apply</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Other towns</td>
                <td className="px-3 py-2">Courier</td>
                <td className="px-3 py-2">Nationwide · days vary by destination</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h2 className="mt-10 font-heading text-2xl font-semibold text-forest">Size exchange</h2>
        <ul className="mt-3 space-y-2 text-sm font-ui list-disc pl-5">
          <li>Within {siteConfig.delivery.exchangeDays} days of pickup or delivery.</li>
          <li>Same model only — different size, not a different design.</li>
          <li>Unused, unworn, original packaging intact. Refunds are not offered.</li>
        </ul>
        <p className="mt-6 text-sm text-muted-foreground font-ui">
          Pay with M-Pesa, card, or cash on delivery in Nairobi. Total shown before you pay.
        </p>
      </main>
      <Footer />
    </div>
  );
}
