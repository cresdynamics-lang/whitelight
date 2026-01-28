import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useEffect } from "react";

export default function TermsOfServicePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-5xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-12 text-white">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight">Terms of Service</h1>
              <div className="space-y-2 text-gray-200 text-sm sm:text-base md:text-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="font-medium">Effective Date: January 28, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Website: <a href="https://whitelightstore.co.ke" className="underline hover:no-underline">whitelightstore.co.ke</a></span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-12">
              <div className="prose prose-lg prose-gray max-w-none">
                <div className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-6 sm:mb-8 md:mb-12 p-3 sm:p-4 md:p-6 bg-gray-50 rounded-xl border-l-4 border-gray-900">
                  Welcome to WhiteLight Store. By accessing or using our website, you agree to be bound by the following Terms of Service. Please read them carefully before making a purchase.
                </div>

                <section className="mb-6 sm:mb-8 md:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 pb-3 border-b-2 border-gray-100">1. Acceptance of Terms</h2>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
                    By placing an order with WhiteLight Store, you acknowledge and agree to these Terms of Service. If you do not agree to any part of these terms, please refrain from using our website.
                  </p>
                </section>

                <section className="mb-6 sm:mb-8 md:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 pb-3 border-b-2 border-gray-100">2. Products and Orders</h2>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 md:p-6">
                    <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-gray-700 text-sm sm:text-base md:text-lg">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>All products are described as accurately as possible on the website.</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>Orders are subject to availability. We reserve the right to refuse or cancel orders if stock is unavailable or if information provided by the customer is incorrect.</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>Prices displayed on the website are in Kenyan Shillings (KES) and are subject to change without prior notice.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="mb-6 sm:mb-8 md:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 pb-3 border-b-2 border-gray-100">3. Payment Terms</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <div className="bg-green-50 rounded-xl p-3 sm:p-4 md:p-6 border border-green-100">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center gap-2 sm:gap-3">
                        <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-green-600 rounded-full"></div>
                        Within Nairobi
                      </h3>
                      <ul className="space-y-1.5 sm:space-y-2 md:space-y-3 text-gray-700 text-xs sm:text-sm md:text-base">
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-600 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <span>Payment on delivery is available for orders within Nairobi.</span>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-600 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <span>Orders placed within Nairobi are eligible for same-day delivery.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 sm:p-4 md:p-6 border border-blue-100">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center gap-2 sm:gap-3">
                        <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-blue-600 rounded-full"></div>
                        Outside Nairobi
                      </h3>
                      <ul className="space-y-1.5 sm:space-y-2 md:space-y-3 text-gray-700 text-xs sm:text-sm md:text-base">
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-600 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <span>Full payment is required before placing the order.</span>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-600 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <span>Orders outside Nairobi will not be dispatched until payment is confirmed.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-6 sm:mb-8 md:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 pb-3 border-b-2 border-gray-100">4. Delivery Policy</h2>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 md:p-6">
                    <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-gray-700 text-sm sm:text-base md:text-lg">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>WhiteLight Store delivers to locations within Kenya.</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span><strong>Delivery within Nairobi:</strong> same-day service for orders confirmed before cutoff time.</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span><strong>Delivery outside Nairobi:</strong> standard delivery timelines apply and are communicated at checkout.</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>Customers are responsible for providing accurate delivery details.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="mb-6 sm:mb-8 md:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 pb-3 border-b-2 border-gray-100">5. Exchange & Return Policy</h2>
                  <div className="bg-amber-50 rounded-xl p-3 sm:p-4 md:p-6 border border-amber-200 mb-4 sm:mb-6">
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                      WhiteLight Store prioritizes customer satisfaction while maintaining product integrity. Please review our exchange policy carefully:
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-red-50 rounded-xl p-3 sm:p-4 md:p-6 border border-red-200">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-800 mb-2 sm:mb-3 md:mb-4">Important Exchange Conditions</h3>
                      <ul className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base md:text-lg">
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                          <span>Exchanges are allowed only for the same shoe type/model.</span>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                          <span>Exchanges are permitted only for a different size. No exchanges are allowed for different designs or products.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 sm:p-4 md:p-6 border border-blue-200">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 mb-2 sm:mb-3 md:mb-4">Required Condition Standards</h3>
                      <ul className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base md:text-lg">
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                          <span>Unused, unworn condition</span>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                          <span>Original packaging intact</span>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                          <span>No damage or alterations</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-100 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-300">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">No Refunds Policy</h3>
                      <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                        Refunds are not offered; only exchanges under the above conditions are permitted. WhiteLight Store reserves the right to refuse exchanges that do not comply with these conditions.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-6 sm:mb-8 md:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 pb-3 border-b-2 border-gray-100">6. Customer Responsibilities</h2>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 md:p-6">
                    <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-gray-700 text-sm sm:text-base md:text-lg">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>Provide accurate personal and delivery information.</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>Ensure availability to receive delivery or provide an alternative delivery address.</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>Inspect exchanged products immediately and report any discrepancies to WhiteLight Store.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="mb-6 sm:mb-8 md:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 pb-3 border-b-2 border-gray-100">7. Limitation of Liability</h2>
                  <div className="bg-yellow-50 rounded-xl p-3 sm:p-4 md:p-6 border border-yellow-200">
                    <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-gray-700 text-sm sm:text-base md:text-lg">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>WhiteLight Store is not responsible for delays or failures caused by third-party delivery services.</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>The company is not liable for indirect, incidental, or consequential damages arising from the use of this website or products purchased.</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-1.5 sm:mt-2 md:mt-3 flex-shrink-0"></div>
                        <span>Liability for defective products is limited to replacement or exchange according to Section 5.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="mb-6 sm:mb-8 md:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 pb-3 border-b-2 border-gray-100">8. Governing Law</h2>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 md:p-6">
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                      These Terms of Service are governed by the laws of Kenya. Any disputes arising from these terms will be resolved in accordance with Kenyan law and local jurisdiction.
                    </p>
                  </div>
                </section>

                <section className="mb-6 sm:mb-8 md:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 pb-3 border-b-2 border-gray-100">9. Contact Information</h2>
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 sm:p-6 md:p-8 text-white">
                    <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 text-gray-200">
                      For questions regarding these Terms of Service, exchanges, or delivery, please contact:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">WhiteLight Store</h3>
                        </div>
                        
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold mb-1 text-gray-300">Website</h4>
                          <a href="https://whitelightstore.co.ke" className="text-sm sm:text-base text-white hover:text-gray-300 underline">
                            whitelightstore.co.ke
                          </a>
                        </div>
                        
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold mb-1 text-gray-300">Phone</h4>
                          <a href="tel:+254708749473" className="text-sm sm:text-base text-white hover:text-gray-300">
                            +254 708 749473
                          </a>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-gray-300">Location</h4>
                        <div className="text-sm sm:text-base text-white space-y-1">
                          <p>Rware Building, Luthuli Avenue</p>
                          <p>Shop 410, Fourth Floor, Nairobi CBD</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="bg-gray-100 rounded-xl p-3 sm:p-4 md:p-6 text-center">
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2">
                    <strong>Last updated:</strong> January 28, 2025
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    These terms are subject to change. Please review periodically for updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}