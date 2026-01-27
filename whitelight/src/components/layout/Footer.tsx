import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, MapPin, Phone, Mail, Check } from "lucide-react";
import { siteConfig } from "@/config/site";

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Subtle diagonal gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-700/20 to-transparent" />
      
      <div className="container relative py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1 - Brand Identity */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {siteConfig.name}
              </h2>
              <p className="text-green-400 font-medium mb-4">
                Walk the Talk — Style that Speaks.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                5+ years of trust in the Kenyan fashion industry. 
                Quality original shoes from authentic brands only.
              </p>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex gap-3">
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-600 transition-all duration-300"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-pink-600 transition-all duration-300"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-400 transition-all duration-300"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-black transition-all duration-300"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Mobile: Quick Links and Services side by side */}
          <div className="md:hidden grid grid-cols-2 gap-12 col-span-1">
            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                    All Collections
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/category/running" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Officials
                  </Link>
                </li>
                <li>
                  <Link to="/category/gym" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Casuals
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">
                Services
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-xs">Quality Original</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-xs">Free Delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-xs">Custom Designs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-xs">Authentic Brands</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-xs">5+ Years Trust</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-xs">Best Sellers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Desktop: Column 2 - Quick Links */}
          <div className="hidden md:block">
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                  All Collections
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/category/running" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Officials
                </Link>
              </li>
              <li>
                <Link to="/category/gym" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Casuals
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Desktop: Column 3 - Services */}
          <div className="hidden md:block">
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">
              Services
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Quality Original Shoes</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Free Delivery in Nairobi</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Custom Designs Available</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Authentic Brands Only</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">5+ Years Trusted Service</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Best Sellers & Trending Styles</span>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Information */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">
              Contact Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <p>Nairobi CBD, Moi Avenue</p>
                  <p>{siteConfig.contact.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{siteConfig.contact.phone}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span className="text-gray-300 text-sm">WhatsApp: {siteConfig.contact.whatsapp}</span>
              </div>
              
              {siteConfig.contact.tillNumber && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Till Number: {siteConfig.contact.tillNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </a>
    </footer>
  );
}
