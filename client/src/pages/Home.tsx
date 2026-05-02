import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="absolute inset-0 z-0">
          {/* landing page hero fireworks explosion dark night sky */}
          <img
            src="/src/images/home_page.png"
            alt="Fireworks background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/60 to-background" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium tracking-wide uppercase">Light Up The Night</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-8xl font-extrabold text-white mb-6 leading-tight"
          >
            Celebrate With <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary-foreground to-secondary">
              Garuda Fireworks
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto font-medium"
          >
            Premium quality, spectacular displays, and uncompromising safety. 
            Browse our exclusive catalogue and make your celebrations unforgettable.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/products"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg bg-secondary text-secondary-foreground shadow-[0_0_40px_-10px_rgba(248,198,61,0.6)] hover:shadow-[0_0_60px_-15px_rgba(248,198,61,0.8)] hover:-translate-y-1 transition-all duration-300"
            >
              Explore Catalogue
            </Link>
            <a 
              href="https://wa.me/919952053009"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Order via WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: "Premium Quality", desc: "Handpicked fireworks for the most vibrant colors and longest burn times." },
              { icon: Zap, title: "Spectacular Effects", desc: "Unique combinations and massive aerial bursts that will drop jaws." },
              { icon: ShieldCheck, title: "Safety Assured", desc: "Rigorous quality control ensuring stable and predictable performance." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-card p-8 rounded-3xl border border-border shadow-lg shadow-black/5 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Featured Collections
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Our most popular and highly requested fireworks for this season.
              </p>
            </div>
            <Link 
              href="/products"
              className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors group"
            >
              View All Products
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-card rounded-3xl aspect-[3/4] border border-border" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to light up the sky?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10">
            Browse our full catalogue and place your order directly via WhatsApp for quick processing and delivery details.
          </p>
          <a 
            href="https://wa.me/919952053009"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg bg-white text-primary shadow-xl hover:scale-105 transition-transform duration-300"
          >
            Contact us on WhatsApp
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
