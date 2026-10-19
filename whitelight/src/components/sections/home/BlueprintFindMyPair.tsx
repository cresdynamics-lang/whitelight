import { useMemo, useState } from "react";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/products";
import {
  matchFindMyPair,
  matchReason,
  type FindMyPairAnswers,
} from "@/lib/productBlueprint";
import { EU_SIZES, useSizePreference } from "@/context/SizePreferenceContext";
import { cn } from "@/lib/utils";
import { trackMetaEvent } from "@/lib/analytics/events";

type Props = { products: Product[] };

const steps = ["activity", "surface", "budget", "size"] as const;

export function BlueprintFindMyPair({ products }: Props) {
  const { preferredSize, setPreferredSize } = useSizePreference();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FindMyPairAnswers>({
    size: preferredSize,
  });

  const matches = useMemo(
    () => matchFindMyPair(products, { ...answers, size: answers.size ?? preferredSize }),
    [products, answers, preferredSize]
  );

  const set = (patch: FindMyPairAnswers) => {
    const next = { ...answers, ...patch };
    setAnswers(next);
    trackMetaEvent("FindMyPair", { ...next, step: steps[step] });
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  return (
    <section className="border-y border-border bg-sage/30 py-12 md:py-16">
      <div className="container grid gap-8 lg:grid-cols-2">
        <div>
          <p className="font-accent text-2xl text-leaf">Find my pair</p>
          <h2 className="font-heading text-3xl font-semibold text-forest">
            Not sure which one? Four taps.
          </h2>
          <p className="mt-2 text-muted-foreground font-ui">
            Tell us what you do and your size. We show three pairs that fit, and why.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-moss font-ui">
            Step {step + 1} of 4
          </p>

          <div className="mt-4 space-y-3">
            {step === 0 && (
              <ChipRow
                options={[
                  { id: "running", label: "Running" },
                  { id: "trail", label: "Trail" },
                  { id: "gym", label: "Gym / training" },
                  { id: "court", label: "Court" },
                ]}
                onPick={(id) => set({ activity: id })}
              />
            )}
            {step === 1 && (
              <ChipRow
                options={[
                  { id: "road", label: "Road / pavement" },
                  { id: "hills", label: "Hills & dirt" },
                  { id: "mud", label: "Mud / wet" },
                  { id: "gym_floor", label: "Gym floor" },
                ]}
                onPick={(id) => set({ surface: id })}
              />
            )}
            {step === 2 && (
              <ChipRow
                options={[
                  { id: "under_6000", label: "Under KES 6,000" },
                  { id: "6000_7000", label: "KES 6,000 – 7,000" },
                  { id: "7000_7500", label: "KES 7,000 – 7,500" },
                  { id: "any", label: "Show me everything" },
                ]}
                onPick={(id) => set({ budget: id })}
              />
            )}
            {step === 3 && (
              <div className="flex flex-wrap gap-2">
                {EU_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setPreferredSize(s);
                      set({ size: s });
                    }}
                    className={cn(
                      "h-10 w-12 rounded-md border text-sm font-semibold font-ui",
                      (answers.size ?? preferredSize) === s
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-card"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {step > 0 && (
              <button
                type="button"
                className="text-sm text-muted-foreground font-ui underline"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-moss font-ui mb-3">
            Your matches so far
          </p>
          <div className="space-y-3">
            {matches.length === 0 && (
              <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground font-ui">
                Keep tapping — matches update as you go.
              </p>
            )}
            {matches.map((p, i) => (
              <NavPrefetchLink
                key={p.id}
                to={`/shoes/${p.slug}`}
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40"
              >
                {i === 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-leaf font-ui">
                    Best match
                  </span>
                )}
                <p className="font-heading text-lg font-semibold text-forest">
                  {p.brand} {p.name}
                </p>
                <p className="text-sm text-muted-foreground font-ui">
                  {matchReason(p, answers)}
                </p>
                <p className="mt-1 font-semibold font-ui">{formatPrice(p.price)}</p>
              </NavPrefetchLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChipRow({
  options,
  onPick,
}: {
  options: { id: string; label: string }[];
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onPick(o.id)}
          className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium font-ui hover:border-primary hover:text-primary"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
