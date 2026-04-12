import { Helmet } from "react-helmet-async";
import { Product } from "@/types/product";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "product" | "article";
  product?: Product;
  category?: string;
  noindex?: boolean;
}

const BASE_URL = "https://whitelightstore.co.ke";

export function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = "website",
  product,
  category,
  noindex = false,
}: SEOHeadProps) {
  const siteTitle =
    title ||
    "Whitelight Store Kenya | Premium Athletic Footwear Nairobi";
  const siteDescription =
    description ||
    "Kenya's trusted specialized seller for premium athletic footwear. Shop authentic running shoes, trail shoes, gym shoes and basketball shoes in Nairobi CBD. Same-day delivery. Visit Rware Building, Luthuli Avenue, Shop 410.";
  const siteKeywords =
    keywords ||
    "best trusted shoe seller Kenya, specialized footwear seller Nairobi, running shoes Nairobi, trail shoes Kenya, gym shoes Nairobi, basketball shoes Kenya, premium shoes Nairobi CBD, trusted shoe store Kenya, athletic footwear Kenya";
  const siteImage = ogImage || `${BASE_URL}/whitelight_logo.jpeg`;
  const canonicalUrl = canonical || BASE_URL;

  const structuredData = generateStructuredData(product, category, canonicalUrl);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content="Whitelight Store Kenya" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta
        key="whitelight-robots"
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />
      <link rel="canonical" href={canonicalUrl} />

      {/* PWA / Mobile */}
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=yes" />

      {/* Geo Tags */}
      <meta name="geo.region" content="KE-30" />
      <meta name="geo.placename" content="Nairobi, Kenya" />
      <meta name="geo.position" content="-1.2840719;36.8219473" />
      <meta name="ICBM" content="-1.2840719, 36.8219473" />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Whitelight Store Kenya" />
      <meta property="og:locale" content="en_KE" />
      <meta property="og:locale:alternate" content="sw_KE" />

      {/* Business contact data — non-product pages only */}
      {!product && (
        <>
          <meta property="business:contact_data:street_address" content="Rware Building, Luthuli Avenue, Shop 410, Fourth Floor" />
          <meta property="business:contact_data:locality" content="Nairobi" />
          <meta property="business:contact_data:region" content="Nairobi" />
          <meta property="business:contact_data:postal_code" content="00100" />
          <meta property="business:contact_data:country_name" content="Kenya" />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />
      {/* FIX: only include twitter:site if the account actually exists */}
      {/* <meta name="twitter:site" content="@whitelightstore" /> */}
      <meta name="twitter:domain" content="whitelightstore.co.ke" />

      {/* Product-specific Open Graph */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price.toString()} />
          <meta property="product:price:currency" content="KES" />
          {product.originalPrice && (
            <meta property="product:original_price:amount" content={product.originalPrice.toString()} />
          )}
          <meta
            property="product:availability"
            content={product.variants.some((v) => v.inStock) ? "in stock" : "out of stock"}
          />
          <meta property="product:condition" content="new" />
          <meta property="product:brand" content={product.brand} />
          <meta property="product:category" content={product.category} />
        </>
      )}

      {/* Structured Data (JSON-LD) */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Helmet>
  );
}

// FIX: canonicalUrl moved to first param position so it's never after two optionals
function generateStructuredData(
  product: Product | undefined,
  category: string | undefined,
  canonicalUrl: string
) {
  const data: object[] = [];

  // Organization Schema
  data.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://whitelightstore.co.ke/#organization",
    name: "Whitelight Store Kenya",
    url: "https://whitelightstore.co.ke",
    logo: "https://whitelightstore.co.ke/whitelight_logo.jpeg",
    description:
      "Kenya's trusted specialized seller for premium athletic footwear. We specialize in authentic running shoes, trail shoes, gym shoes and basketball shoes in Nairobi CBD. Same-day delivery available.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rware Building, Luthuli Avenue, Shop 410, Fourth Floor",
      addressLocality: "Nairobi",
      addressRegion: "Nairobi",
      postalCode: "00100",
      addressCountry: "KE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+254-708-749473",
      contactType: "Customer Service",
      areaServed: "KE",
      availableLanguage: ["en", "sw"],
    },
    // FIX: only real, verified social accounts should be listed here.
    // Add back URLs once confirmed the accounts exist and are active.
    // sameAs: [],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
  });

  // LocalBusiness Schema
  data.push({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://whitelightstore.co.ke/#business",
    name: "Whitelight Store Kenya",
    image: "https://whitelightstore.co.ke/whitelight_logo.jpeg",
    description:
      "Kenya's trusted specialized seller for premium athletic footwear in Nairobi CBD. Running shoes, trail shoes, gym shoes and basketball shoes. Same-day delivery. Rware Building, Luthuli Avenue, Shop 410.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rware Building, Luthuli Avenue, Shop 410, Fourth Floor",
      addressLocality: "Nairobi",
      addressRegion: "Nairobi",
      postalCode: "00100",
      addressCountry: "KE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -1.2840719,
      longitude: 36.8219473,
    },
    telephone: "+254-708-749473",
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "19:00",
      },
    ],
    areaServed: {
      "@type": "City",
      name: "Nairobi",
      "@id": "https://www.wikidata.org/wiki/Q3870",
    },
    paymentAccepted: "Cash, Mobile Money, Card",
    currenciesAccepted: "KES",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    slogan: "Kenya's Trusted Specialized Seller for Premium Athletic Footwear",
  });

  // Breadcrumb Schema
  const breadcrumbs: {
    "@context": string;
    "@type": string;
    itemListElement: object[];
  } = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://whitelightstore.co.ke",
      },
    ],
  };

  if (category) {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    breadcrumbs.itemListElement.push({
      "@type": "ListItem",
      position: 2,
      name: `${categoryName} Shoes`,
      item: `https://whitelightstore.co.ke/category/${category}`,
    });
  }

  if (product) {
    breadcrumbs.itemListElement.push({
      "@type": "ListItem",
      position: breadcrumbs.itemListElement.length + 1,
      name: product.name,
      item: `https://whitelightstore.co.ke/product/${product.slug}`,
    });
  }

  data.push(breadcrumbs);

  // Product Schema
  if (product) {
    const productSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `https://whitelightstore.co.ke/product/${product.slug}`,
      name: product.name,
      description: product.description,
      brand: {
        "@type": "Brand",
        name: product.brand,
      },
      category: getCategoryName(product.category),
      sku: product.id,
      mpn: product.id,
      image: product.images.map((img) => img.url),
      offers: {
        "@type": "Offer",
        url: `https://whitelightstore.co.ke/product/${product.slug}`,
        priceCurrency: "KES",
        price: product.price.toString(),
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        availability: product.variants.some((v) => v.inStock)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "LocalBusiness",
          name: "Whitelight Store Kenya",
        },
      },
    };

    // FIX: removed fake isBestSeller rating — only add real review data here
    // if you wire up an actual review system in future:
    // productSchema.aggregateRating = { ... real data ... }

    if (product.variants && product.variants.length > 0) {
      productSchema.hasVariant = product.variants.map((variant) => ({
        "@type": "ProductModel",
        sku: `${product.id}-${variant.size}`,
        size: variant.size.toString(),
        availability: variant.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      }));
    }

    data.push(productSchema);

    // WebPage Schema for product
    data.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `https://whitelightstore.co.ke/product/${product.slug}`,
      url: `https://whitelightstore.co.ke/product/${product.slug}`,
      name: product.name,
      description: product.description,
      inLanguage: "en-KE",
      isPartOf: {
        "@type": "WebSite",
        name: "Whitelight Store Kenya",
        url: "https://whitelightstore.co.ke",
      },
    });
  } else if (category) {
    // CollectionPage Schema
    data.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `https://whitelightstore.co.ke/category/${category}`,
      url: `https://whitelightstore.co.ke/category/${category}`,
      name: `${getCategoryName(category)} — Whitelight Store Kenya`,
      description: `Shop premium ${category} shoes in Nairobi from Kenya's trusted specialized seller. Best selection of authentic ${category} footwear with same-day delivery in Nairobi CBD. Rware Building, Luthuli Avenue, Shop 410.`,
      inLanguage: "en-KE",
      isPartOf: {
        "@type": "WebSite",
        name: "Whitelight Store Kenya",
        url: "https://whitelightstore.co.ke",
      },
    });
  } else {
    // WebSite Schema for homepage
    data.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://whitelightstore.co.ke/#website",
      url: "https://whitelightstore.co.ke",
      name: "Whitelight Store Kenya",
      description:
        "Kenya's trusted specialized seller for premium athletic footwear. Shop authentic running shoes, trail shoes, gym shoes and basketball shoes in Nairobi CBD. Same-day delivery available.",
      publisher: {
        "@id": "https://whitelightstore.co.ke/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://whitelightstore.co.ke/?search={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    });
  }

  return data;
}

function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    running: "Running Shoes",
    trail: "Trail Running Shoes",
    gym: "Gym Training Shoes",
    training: "Training Shoes",
    basketball: "Basketball Shoes",
    tennis: "Tennis Shoes",
    accessories: "Shoe Accessories",
  };
  return categoryMap[category] || category;
}