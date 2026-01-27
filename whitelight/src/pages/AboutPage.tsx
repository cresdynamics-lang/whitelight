import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Star, Users, Award, Zap, Shield, Flame, Heart } from "lucide-react";

const testimonials = [
  {
    name: "James Kipchoge",
    role: "Marathon Runner",
    content: "Whitelight shoes transformed my running experience. The comfort and performance are unmatched!",
    rating: 5
  },
  {
    name: "Grace Wanjiku",
    role: "Fitness Enthusiast",
    content: "Best investment I've made for my workouts. These shoes handle everything from HIIT to weightlifting.",
    rating: 5
  },
  {
    name: "Brian Otieno",
    role: "Basketball Player",
    content: "The grip and support are incredible. My game has improved significantly since switching to Whitelight.",
    rating: 5
  },
  {
    name: "Faith Chebet",
    role: "Trail Runner",
    content: "Perfect for my mountain adventures. Durable, comfortable, and stylish - everything I need!",
    rating: 5
  },
  {
    name: "Samuel Mwangi",
    role: "Gym Owner",
    content: "I recommend Whitelight to all my clients. The quality and performance speak for themselves.",
    rating: 5
  },
  {
    name: "Mary Akinyi",
    role: "Personal Trainer",
    content: "These shoes keep up with my intense training sessions. Comfort that lasts all day long!",
    rating: 5
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background carousel */}
        <div className="absolute inset-0">
          <div className="flex animate-scroll h-full">
            <img src="/couresel_images/running/running2.png" alt="Running" className="h-full w-screen object-cover flex-shrink-0" />
            <img src="/couresel_images/trail/trail1.png" alt="Trail" className="h-full w-screen object-cover flex-shrink-0" />
            <img src="/couresel_images/gym/gym.png" alt="Gym" className="h-full w-screen object-cover flex-shrink-0" />
            <img src="/couresel_images/basketball/bk1.png" alt="Basketball" className="h-full w-screen object-cover flex-shrink-0" />
            <img src="/couresel_images/orthopedic/orth1.jpg" alt="Orthopedic" className="h-full w-screen object-cover flex-shrink-0" />
          </div>
        </div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="container relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-heading text-6xl md:text-8xl font-black text-white mb-6">
              ABOUT WHITELIGHT
            </h1>
            <p className="font-body text-2xl text-gray-300 leading-relaxed">
              Where performance meets style. We're not just selling shoes - we're crafting experiences that elevate your every step.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading text-3xl font-bold text-black mb-2">50K+</h3>
              <p className="font-body text-lg text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading text-3xl font-bold text-black mb-2">5+</h3>
              <p className="font-body text-lg text-gray-600">Years Experience</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading text-3xl font-bold text-black mb-2">100+</h3>
              <p className="font-body text-lg text-gray-600">Shoe Models</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading text-3xl font-bold text-black mb-2">4.9</h3>
              <p className="font-body text-lg text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="font-heading text-5xl font-bold text-black mb-12 text-center">
            OUR STORY
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-h-[500px]">
              <img 
                src="/ourstoryimage.jpeg" 
                alt="Our Story" 
                className="w-full h-full max-h-[500px] object-cover object-top rounded-lg shadow-lg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="space-y-6 font-body text-xl text-gray-700 leading-relaxed">
                <p>
                  Step into a world where every stride feels stronger. Our shoe store is built for movers, grinders, and go-getters—whether you're chasing a personal best on the track, powering through gym sessions, or conquering rugged trails.
                </p>
                <p>
                  From lightweight running shoes engineered for speed and comfort, to gym shoes that deliver stability and support, to trail shoes designed to grip, protect, and perform off-road, we've got the perfect fit for every journey.
                </p>
                <p>
                  Premium brands, cutting-edge technology, and styles that move as boldly as you do—because your feet deserve gear that works as hard as you do. Lace up, level up, and run your world. 🏃♂️👟💪
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <WhyChooseUs imagePath="/whychooseus.png" />

      {/* Moving Testimonials */}
      <section className="py-20 bg-black overflow-hidden">
        <div className="container mb-12">
          <h2 className="font-heading text-5xl font-bold text-white text-center mb-4">
            WHAT OUR CUSTOMERS SAY
          </h2>
          <p className="font-body text-xl text-gray-300 text-center">
            Real stories from real athletes
          </p>
        </div>
        
        {/* Moving testimonials container */}
        <div className="relative">
          <div className="flex animate-scroll space-x-8">
            {/* First set of testimonials */}
            {testimonials.map((testimonial, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 w-96 bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-purple-500 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4 text-white font-bold text-xl">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-bold text-white">
                      {testimonial.name}
                    </h4>
                    <p className="font-body text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="font-body text-lg text-gray-300 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {testimonials.map((testimonial, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 w-96 bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-purple-500 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4 text-white font-bold text-xl">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-bold text-white">
                      {testimonial.name}
                    </h4>
                    <p className="font-body text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="font-body text-lg text-gray-300 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="font-heading text-5xl font-bold text-black text-center mb-16">
            OUR VALUES
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl">
                <Shield className="h-10 w-10 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-black mb-4">QUALITY</h3>
              <p className="font-body text-lg text-gray-600">
                We never compromise on quality. Every shoe is carefully selected and tested to meet our high standards.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl">
                <Flame className="h-10 w-10 text-white group-hover:animate-bounce" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-black mb-4">PERFORMANCE</h3>
              <p className="font-body text-lg text-gray-600">
                Built for athletes, designed for performance. Our shoes enhance your natural abilities.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl">
                <Heart className="h-10 w-10 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-black mb-4">COMMUNITY</h3>
              <p className="font-body text-lg text-gray-600">
                We're more than a store - we're a community of athletes, dreamers, and achievers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}