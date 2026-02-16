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
  const siteTitle = title || "Whitelight Store Kenya - Premium Athletic Footwear in Nairobi";
  const siteDescription = description || "Kenya's premier footwear destination. Shop premium running shoes, trail shoes, gym shoes, basketball shoes & accessories in Nairobi CBD. Same day delivery available.";
  const siteKeywords = keywords || "shoes Kenya, running shoes Nairobi, trail shoes Kenya, gym shoes Nairobi, basketball shoes Kenya, footwear store Nairobi CBD";
  const siteImage = ogImage || `${BASE_URL}/whitelight_logo.jpeg`;
  const canonicalUrl = canonical || BASE_URL;

  // Generate structured data
  const structuredData = generateStructuredData(product, category, canonicalUrl);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Geo Tags for Nairobi */}
      <meta name="geo.region" content="KE-30" />
      <meta name="geo.placename" content="Nairobi, Kenya" />
      <meta name="geo.position" content="-1.2840719;36.8219473" />
      <meta name="ICBM" content="-1.2840719, 36.8219473" />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Whitelight Store Kenya" />
      <meta property="og:locale" content="en_KE" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />
      <meta name="twitter:site" content="@whitelightstore" />

      {/* Product-specific Open Graph */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price.toString()} />
          <meta property="product:price:currency" content="KES" />
          {product.originalPrice && (
            <meta property="product:original_price:amount" content={product.originalPrice.toString()} />
          )}
          <meta property="product:availability" content={product.variants.some(v => v.inStock) ? "in stock" : "out of stock"} />
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

function generateStructuredData(
  product?: Product,
  category?: string,
  canonicalUrl: string
) {
  const data: any[] = [];

  // Organization Schema
  data.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Whitelight Store Kenya",
    url: "https://whitelightstore.co.ke",
    logo: "https://whitelightstore.co.ke/whitelight_logo.jpeg",
    description: "Kenya's premier footwear destination specializing in premium running, trail, gym, and basketball shoes in Nairobi CBD.",
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
    sameAs: [
      "https://www.facebook.com/whitelightstore",
      "https://www.instagram.com/whitelightstore",
      "https://twitter.com/whitelightstore",
    ],
  });

  // LocalBusiness Schema
  data.push({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://whitelightstore.co.ke/#business",
    name: "Whitelight Store Kenya",
    image: "https://whitelightstore.co.ke/whitelight_logo.jpeg",
    description: "Premium athletic footwear store in Nairobi CBD. Specializing in running shoes, trail shoes, gym shoes, and basketball shoes. Same day delivery available.",
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
    servesCuisine: false,
    paymentAccepted: "Cash, Mobile Money, Card",
    currenciesAccepted: "KES",
  });

  // Breadcrumb Schema
  const breadcrumbs: any = {
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
      position: breadcrumbs.itemListElement.length + 1,
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

  // Product Schema (if product provided)
  if (product) {
    const productSchema: any = {
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
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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

    if (product.originalPrice && product.originalPrice > product.price) {
      productSchema.offers.priceSpecification = {
        "@type": "UnitPriceSpecification",
        price: product.price.toString(),
        priceCurrency: "KES",
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: 1,
        },
      };
    }

    // Aggregate rating (if you have reviews)
    if (product.isBestSeller) {
      productSchema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "50",
        bestRating: "5",
        worstRating: "1",
      };
    }

    // Product variants (sizes)
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

    // WebPage Schema for product page
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
      about: {
        "@type": "Product",
        name: product.name,
      },
    });
  } else if (category) {
    // CollectionPage Schema for category pages
    data.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `https://whitelightstore.co.ke/category/${category}`,
      url: `https://whitelightstore.co.ke/category/${category}`,
      name: `${getCategoryName(category)} Shoes - Whitelight Store Kenya`,
      description: `Shop premium ${category} shoes in Nairobi. Best selection of ${category} footwear with same day delivery in Nairobi CBD.`,
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
      description: "Kenya's premier footwear destination specializing in premium running, trail, gym, and basketball shoes.",
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
    basketball: "Basketball Shoes",
    accessories: "Shoe Accessories",
  };
  return categoryMap[category] || category;
}
