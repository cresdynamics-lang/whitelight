import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { siteConfig } from "@/config/site";
import { Link } from "react-router-dom";

const ROWS = [
  ["25.0", "40", "6", "7"],
  ["26.0", "41", "7", "8"],
  ["27.0", "43", "9", "10"],
  ["28.0", "44", "10", "11"],
  ["29.0", "45", "11", "12"],
  ["30.0", "46", "12", "13"],
];

export default function SizeGuidePage() {
  const wa = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "");
  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
      <SEOHead
        title="Running Shoe Size Guide Kenya | The Whitelight"
        description="Measure your foot, EU/UK/US chart, and fit notes. Exchange within 3 days if size is wrong."
        canonical="https://whitelightstore.co.ke/size-guide"
      />
      <Header />
      <main className="container max-w-3xl py-10 md:py-14">
        <h1 className="font-heading text-3xl md:text-4xl font-semibold text-forest">
          Size guide
        </h1>
        <p className="mt-3 text-muted-foreground font-ui">
          Measure in the afternoon, leave a thumb’s width at the toe, and message us your usual
          brand if you are between sizes.
        </p>
        <ol className="mt-6 list-decimal pl-5 space-y-2 font-ui text-sm">
          <li>Place paper against a wall on a hard floor.</li>
          <li>Stand with heel to the wall; mark the longest toe.</li>
          <li>Measure both feet in centimetres; use the longer foot.</li>
          <li>Leave about 1–1.5 cm spare length in the shoe.</li>
        </ol>
        <div className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm font-ui">
            <thead className="bg-sage/50">
              <tr>
                {["CM", "EU", "UK", "US Men"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r[0]} className="border-t border-border">
                  {r.map((c) => (
                    <td key={c} className="px-3 py-2">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground font-ui">
          Brand fit varies. Sample chart — confirm on WhatsApp for the exact model in stock.
        </p>
        <p className="mt-4 text-sm font-ui">
          Wrong size? Exchange within {siteConfig.delivery.exchangeDays} days, same model, unworn,
          in the box. See <Link to="/delivery" className="text-primary font-semibold">delivery & exchanges</Link>.
        </p>
        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent(
            "Hi — I measured my foot. Can you help me pick a size?"
          )}`}
          className="mt-6 inline-flex h-11 items-center rounded-md bg-whatsapp px-5 text-sm font-semibold text-white font-ui"
          target="_blank"
          rel="noopener noreferrer"
        >
          Message us your size
        </a>
      </main>
      <Footer />
    </div>
  );
}
