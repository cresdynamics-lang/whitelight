import { Link } from "react-router-dom";
import { SHOP_BRANDS } from "@/config/brands";

interface HomeBrandsProps {
  title?: string;
}

export function HomeBrands({ title = "Shop by brand" }: HomeBrandsProps) {
  return (
    <section className="wh-section wh-shell">
      <div className="wh-section__head">
        <h2>{title}</h2>
      </div>
      <div className="wh-brands">
        {SHOP_BRANDS.map((brand) => (
          <Link key={brand.slug} to={`/brand/${brand.slug}`}>
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
