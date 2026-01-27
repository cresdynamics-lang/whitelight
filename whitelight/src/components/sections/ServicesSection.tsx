import { Truck, MapPin, CreditCard, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";

export function ServicesSection() {
  const services = [
    {
      icon: Clock,
      title: "Same Day Delivery",
      description: siteConfig.services.sameDayDelivery,
      color: "text-blue-600"
    },
    {
      icon: Truck,
      title: "Nationwide Delivery", 
      description: siteConfig.services.nationwideDelivery,
      color: "text-green-600"
    },
    {
      icon: CreditCard,
      title: "Payment on Delivery",
      description: siteConfig.services.codNairobi,
      color: "text-purple-600"
    },
    {
      icon: MapPin,
      title: "Visit Our Store",
      description: siteConfig.services.location,
      color: "text-orange-600"
    }
  ];

  return (
    <>
    <section className="py-16 bg-gradient-to-br from-[#05070f] via-[#0b1120] to-[#0f172a] relative overflow-hidden">
      {/* Background Blur Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#ff8c32] opacity-20 blur-[120px] rounded-full" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1bbfb3] opacity-20 blur-[120px] rounded-full" />
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">Our Services</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            We're committed to providing you with the best shopping experience and convenient delivery options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 text-center hover:bg-white/20 transition-all">
              <service.icon className={`h-12 w-12 mx-auto mb-4 text-white`} />
              <h3 className="font-semibold mb-2 text-white">{service.title}</h3>
              <p className="text-sm text-white/80">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Google Map Section - Separate with light background */}
    <section className="py-16 bg-secondary/30">
      <div className="container">

        {/* Google Map */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Find Us</h3>
            <p className="text-muted-foreground">Nairobi CBD, Moi Avenue - Luthuli Avenue, Rware Building Shop 410</p>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8199406728!2d36.82194731475394!3d-1.2840718990644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d22c4e4c4d%3A0x4b9b9b9b9b9b9b9b!2sLuthuli%20Avenue%2C%20Nairobi%20CBD!5e0!3m2!1sen!2ske!4v1635789012345!5m2!1sen!2ske"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Whitelight Store Location"
            />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}