import { Sparkles, Phone, MapPin, Mail } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground/80 py-16 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group inline-flex">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-primary-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Garuda Fireworks
              </span>
            </Link>
            <p className="text-primary-foreground/70 leading-relaxed">
              Premium quality fireworks for your grandest celebrations. We bring the sparkle to your special moments safely and spectacularly.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary-foreground uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-secondary transition-colors">Browse Catalog</Link>
              </li>
              <li>
                <a href="https://wa.me/919952053009" className="hover:text-secondary transition-colors">Order on WhatsApp</a>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary-foreground uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span>+91 99940 85275</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span>Sivakasi, Tamil Nadu<br/>India</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span>info@garudafireworks.com</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-primary-foreground/10 mt-16 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Garuda Fireworks. All rights reserved.</p>
          <p className="text-sm mt-1 text-gray-400">
            Developed by Rookiezz Solution ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
