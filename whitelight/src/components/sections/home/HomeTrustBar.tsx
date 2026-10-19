interface HomeTrustItem {
  title: string;
  subtitle: string;
}

interface HomeTrustBarProps {
  items?: HomeTrustItem[];
}

const defaultItems: HomeTrustItem[] = [
  { title: "Same-day Nairobi delivery", subtitle: "Fast local fulfilment where available." },
  { title: "M-Pesa or pay on delivery", subtitle: "Simple payment options at checkout." },
  { title: "48-hour size exchange", subtitle: "Easy support if the fit is not right." },
];

export function HomeTrustBar({ items = defaultItems }: HomeTrustBarProps) {
  if (items.length === 0) return null;

  return (
    <section className="wh-trust">
      <div className="wh-shell">
        <div className="wh-trust__grid">
          {items.map((item) => (
            <p key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
