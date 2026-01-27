import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Ruler, Activity, MapPin, Dumbbell, Zap } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

const BuyingGuidePage = () => {
  const { data: products = [], isLoading } = useProducts();
  
  // Get sample products from each category with safe array check
  const getCategoryImage = (category: string) => {
    if (!Array.isArray(products) || products.length === 0) {
      return null;
    }
    const categoryProducts = products.filter(p => p.category === category);
    return categoryProducts.length > 0 ? categoryProducts[0].images[0]?.url : null;
  };

  // Show loading state while products are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const sizeGuide = [
    { eu: 38, uk: 5, us: 6, cm: 24.0 },
    { eu: 39, uk: 5.5, us: 6.5, cm: 24.5 },
    { eu: 40, uk: 6, us: 7, cm: 25.0 },
    { eu: 41, uk: 7, us: 8, cm: 25.5 },
    { eu: 42, uk: 7.5, us: 8.5, cm: 26.0 },
    { eu: 43, uk: 8.5, us: 9.5, cm: 27.0 },
    { eu: 44, uk: 9, us: 10, cm: 27.5 },
    { eu: 45, uk: 10, us: 11, cm: 28.0 },
  ];

  const categories = [
    {
      name: "Running Shoes",
      icon: Activity,
      description: "Engineered for road running, jogging, and daily training sessions",
      features: ["Lightweight construction", "Responsive cushioning", "Breathable mesh upper"],
      bestFor: "Daily runs, marathons, speed training",
      image: getCategoryImage("running") || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop"
    },
    {
      name: "Trail Shoes",
      icon: MapPin,
      description: "Built for off-road adventures and challenging terrain",
      features: ["Aggressive traction outsole", "Rock plate protection", "Water-resistant materials"],
      bestFor: "Hiking, trail running, outdoor adventures",
      image: getCategoryImage("trail") || "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=200&fit=crop"
    },
    {
      name: "Training Shoes",
      icon: Dumbbell,
      description: "Versatile footwear for cross-training and gym workouts",
      features: ["Stable platform design", "Multi-directional support", "Durable construction"],
      bestFor: "CrossFit, weightlifting, HIIT workouts",
      image: getCategoryImage("gym") || "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300&h=200&fit=crop"
    },
    {
      name: "Basketball Shoes",
      icon: Zap,
      description: "Performance footwear designed for court dominance",
      features: ["High-top ankle support", "Court-specific traction", "Impact cushioning"],
      bestFor: "Basketball, streetball, casual wear",
      image: getCategoryImage("basketball") || "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=300&h=200&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 border-b overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="/buyingguide.png" 
              alt="Buying Guide" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Shoe Buying Guide
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                Make informed decisions with our comprehensive guide. From proper sizing to performance features, 
                find the perfect footwear for your needs.
              </p>
            </div>
          </div>
        </section>

        {/* Size Guide Section */}
        <section className="py-16 bg-white">
          <div className="px-8">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Ruler className="h-6 w-6 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">Size Guide</h2>
              </div>
              <p className="text-gray-600 text-lg">Accurate sizing ensures comfort and performance</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border border-gray-200">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-semibold text-gray-900">EU</th>
                            <th className="text-left p-4 font-semibold text-gray-900">UK</th>
                            <th className="text-left p-4 font-semibold text-gray-900">US</th>
                            <th className="text-left p-4 font-semibold text-gray-900">Length (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sizeGuide.map((size, index) => (
                            <tr key={size.eu} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-4 font-medium text-gray-900">{size.eu}</td>
                              <td className="p-4 text-gray-700">{size.uk}</td>
                              <td className="p-4 text-gray-700">{size.us}</td>
                              <td className="p-4 text-gray-700">{size.cm}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="border border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-900">Measuring Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Measure feet in the evening when they're largest</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Stand on paper and trace your foot outline</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Measure from heel to longest toe</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Use the larger foot measurement</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-lg text-gray-600">Different activities require different features</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {categories.map((category) => (
                <Card key={category.name} className="border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <category.icon className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">{category.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {category.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Badge variant="outline" className="text-xs font-medium">
                      Best for: {category.bestFor}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Fit & Care Section */}
        <section className="py-16 bg-white">
          <div className="px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Perfect Fit */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Perfect Fit Checklist</h2>
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {[
                        "Thumb's width of space between longest toe and shoe end",
                        "Snug fit around heel with no slipping",
                        "Comfortable width - no pinching or bulging",
                        "Arch support that matches your foot type"
                      ].map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Replacement Guide */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">When to Replace</h2>
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {[
                        { type: "Running shoes", time: "Every 500-800 km" },
                        { type: "Training shoes", time: "Every 6-12 months" },
                        { type: "Basketball shoes", time: "When traction wears" },
                        { type: "Trail shoes", time: "When lugs wear smooth" }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                          <span className="font-medium text-gray-900">{item.type}</span>
                          <Badge variant="secondary">{item.time}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Care Instructions */}
        <section className="py-16 bg-gray-50">
          <div className="px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Care & Maintenance</h2>
              <p className="text-lg text-gray-600">Extend the life of your footwear investment</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Daily Care",
                  tips: ["Remove dirt after each use", "Air dry naturally", "Use shoe trees", "Rotate between pairs"]
                },
                {
                  title: "Deep Cleaning",
                  tips: ["Remove laces and insoles", "Use appropriate cleaner", "Scrub gently", "Air dry completely"]
                },
                {
                  title: "Protection",
                  tips: ["Apply waterproof spray", "Store in cool, dry place", "Use cedar shoe trees", "Replace worn insoles"]
                }
              ].map((section) => (
                <Card key={section.title} className="border border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.tips.map((tip, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BuyingGuidePage;