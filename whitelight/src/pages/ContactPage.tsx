import { useState } from "react";
import { MessageCircle, Phone, Mail, MapPin, Send, Clock, Users, Star, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { toast } from "sonner";
import { contactService } from "@/services/contactService";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    alternativePhone: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setFormStatus("idle");

    try {
      await contactService.create({
        name: formData.fullName,
        email: formData.email,
        subject: "Contact Form Submission",
        message: `WhatsApp: ${formData.whatsapp}\nAlternative Phone: ${formData.alternativePhone}\n\nMessage:\n${formData.message}`,
      });

      const message = `*Contact Form Message*\n\nName: ${formData.fullName}\nEmail: ${formData.email}\nWhatsApp: ${formData.whatsapp}\nAlternative Phone: ${formData.alternativePhone}\n\nMessage:\n${formData.message}`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodedMessage}`, "_blank");

      setFormStatus("success");
      toast.success("Message sent successfully!");
      setFormData({ fullName: "", email: "", whatsapp: "", alternativePhone: "", message: "" });
    } catch (error) {
      setFormStatus("error");
      toast.error("Failed to send message");
    }

    setIsSending(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Section 1: Hero Section - Dark Theme */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#05070f] via-[#0b1120] to-[#0f172a]">
          {/* Background Blur Effects */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#ff8c32] opacity-40 blur-[120px] rounded-full" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1bbfb3] opacity-30 blur-[120px] rounded-full" />

          <div className="container relative z-10 py-16 md:py-24 lg:py-32">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center max-w-7xl mx-auto">
              {/* Left Column - Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur">
                  <span className="text-xs uppercase tracking-wider text-white/90">Premium Footwear</span>
                </div>

                <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight">
                  Nairobi's Premier Footwear Destination
                </h1>

                <p className="text-lg md:text-xl text-white/80 max-w-2xl">
                  Step into Nairobi's most personal footwear experience. From running to casual, we curate the perfect shoe for your lifestyle.
                </p>

                {/* Feature Cards */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  {[
                    { title: "Curated Selection", desc: "Hand-picked premium brands" },
                    { title: "Expert Guidance", desc: "Personalized fitting service" },
                    { title: "Fast Delivery", desc: "Quick delivery across Nairobi" },
                    { title: "Quality Assured", desc: "100% authentic products" }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                      className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
                    >
                      <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                      <p className="text-white/80 text-sm">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column - Image Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur p-6"
              >
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
                    alt="Premium Footwear"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-lg font-semibold">{siteConfig.contact.address}</p>
                    <p className="text-white/80">Monday - Saturday: 8am - 7pm</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 2: Contact Channels - Dark Theme */}
        <section className="relative bg-gradient-to-b from-[#0f172a] to-[#05070f] py-16 md:py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                Get In Touch
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                Choose your preferred way to connect with us
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* WhatsApp Concierge */}
              <motion.a
                href={`https://wa.me/${siteConfig.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="group p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition-all"
              >
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-white font-semibold text-lg mb-2">WhatsApp Concierge</h3>
                <p className="text-white/70 text-sm mb-4">Get instant assistance on WhatsApp</p>
                <p className="text-[#1bbfb3] font-medium">{siteConfig.contact.phone}</p>
                <div className="mt-4 px-4 py-2 bg-[#1bbfb3] text-white rounded-full text-sm font-medium inline-block group-hover:shadow-lg transition-shadow">
                  Chat Now
                </div>
              </motion.a>

              {/* Phone Support */}
              <motion.a
                href={`tel:${siteConfig.contact.phone}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="group p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition-all"
              >
                <div className="text-4xl mb-4">📞</div>
                <h3 className="text-white font-semibold text-lg mb-2">Call Studio</h3>
                <p className="text-white/70 text-sm mb-4">Speak directly with our team</p>
                <p className="text-[#ff8c32] font-medium">{siteConfig.contact.phone}</p>
                <div className="mt-4 px-4 py-2 bg-[#ff8c32] text-white rounded-full text-sm font-medium inline-block group-hover:shadow-lg transition-shadow">
                  Call Now
                </div>
              </motion.a>

              {/* Visit Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur md:col-span-2 lg:col-span-1"
              >
                <div className="text-4xl mb-4">📍</div>
                <h3 className="text-white font-semibold text-lg mb-2">Visit Our Store</h3>
                <p className="text-white/70 text-sm mb-4">{siteConfig.contact.address}</p>
                <p className="text-white/90 font-medium">{siteConfig.contact.city}</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 3: Contact Form & Stats - Light Theme */}
        <section className="relative bg-gradient-to-b from-white to-slate-50 py-16 md:py-20">
          <div className="container">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 max-w-7xl mx-auto">
              {/* Left Column - Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative rounded-[28px] border border-slate-200/80 bg-white/90 backdrop-blur p-8 shadow-2xl"
              >
                {/* Gradient Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff8c32] via-[#1bbfb3] to-[#5b8def] rounded-t-[28px]" />

                {/* Form Header */}
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Contact Us</p>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
                    Send Us A Message
                  </h2>
                  <p className="text-slate-600">
                    Fill out the form and our team will get back to you within 10 minutes
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="pl-10 rounded-2xl bg-white/60 border-slate-200 focus:border-[#1bbfb3] focus:ring-[#1bbfb3] shadow-inner"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 rounded-2xl bg-white/60 border-slate-200 focus:border-[#1bbfb3] focus:ring-[#1bbfb3] shadow-inner"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone Numbers Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-slate-700">WhatsApp Number</Label>
                      <div className="relative">
                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="+254 XXX XXX XXX"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          className="pl-10 rounded-2xl bg-white/60 border-slate-200 focus:border-[#1bbfb3] focus:ring-[#1bbfb3] shadow-inner"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternativePhone" className="text-slate-700">Alternative Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="alternativePhone"
                          type="tel"
                          placeholder="+254 XXX XXX XXX"
                          value={formData.alternativePhone}
                          onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                          className="pl-10 rounded-2xl bg-white/60 border-slate-200 focus:border-[#1bbfb3] focus:ring-[#1bbfb3] shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-700">Your Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us what you're looking for or any questions you have..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="rounded-2xl bg-white/60 border-slate-200 focus:border-[#1bbfb3] focus:ring-[#1bbfb3] shadow-inner resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-[#ff8c32] hover:bg-[#ff7a1a] text-white rounded-full py-6 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    {isSending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>

                  {/* Status Messages */}
                  {formStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800"
                    >
                      <Check className="h-5 w-5" />
                      <span>Message sent successfully! We'll get back to you soon.</span>
                    </motion.div>
                  )}
                  {formStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800"
                    >
                      <AlertCircle className="h-5 w-5" />
                      <span>Failed to send message. Please try again.</span>
                    </motion.div>
                  )}
                </form>
              </motion.div>

              {/* Right Column - Stats & Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "👥", value: "5,000+", label: "Happy Customers" },
                    { icon: "⭐", value: "4.9/5", label: "Customer Rating" },
                    { icon: "⚡", value: "< 3 hrs", label: "Delivery Time" },
                    { icon: "💯", value: "100%", label: "Authentic" }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm"
                    >
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <p className="text-2xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm text-slate-600">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Service Info Card */}
                <div className="p-6 rounded-[28px] bg-white/80 backdrop-blur border border-slate-200 shadow-lg">
                  <h3 className="font-semibold text-lg mb-4">Why Choose Us</h3>
                  <ul className="space-y-3">
                    {[
                      "🎯 Personalized shoe fitting service",
                      "✅ 100% authentic products guaranteed",
                      "🚀 Fast delivery across Nairobi",
                      "💬 24/7 WhatsApp support"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Testimonial Card */}
                <div className="relative p-6 rounded-[28px] bg-slate-900 text-white overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#1bbfb3] opacity-20 blur-3xl rounded-full" />
                  <div className="relative z-10">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm mb-4 italic">
                      "Best shoe shopping experience in Nairobi! The team helped me find perfect running shoes. Highly recommend!"
                    </p>
                    <p className="font-semibold text-sm">John M. - Westlands</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 4: Final CTA - Dark Theme */}
        <section className="relative overflow-hidden bg-[#05070f] py-16 md:py-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff8c32] opacity-20 blur-[120px] rounded-full" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container relative z-10"
          >
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur mb-6">
                <span className="text-xs uppercase tracking-wider text-white/90">Ready to step up?</span>
              </div>

              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                Experience Premium Footwear Today
              </h2>

              <p className="text-white/70 text-lg mb-8">
                Visit our store or connect with us online to find your perfect pair
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-[#1bbfb3] hover:bg-[#18a89f] text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat on WhatsApp
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-full px-8 py-6 text-base font-semibold backdrop-blur hover:-translate-y-0.5 transition-all"
                >
                  <a href={`tel:${siteConfig.contact.phone}`}>
                    <Phone className="h-5 w-5 mr-2" />
                    Call Us Now
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Helper icon component (add to imports if not using lucide-react User icon)
const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
