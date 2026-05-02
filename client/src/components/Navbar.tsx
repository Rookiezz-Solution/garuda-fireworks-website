import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Sparkles, Menu, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/CartContext";

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("clientTheme") !== "light";
  });
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("clientTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "py-3 glass-panel shadow-lg" : "py-5 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow"
            >
              <img
                src="/src/images/garuda_logo.png"
                alt="Garuda Logo"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <span className={cn(
              "text-2xl font-black tracking-tight transition-colors",
              isScrolled ? "text-foreground" : darkMode ? "text-foreground lg:text-white" : "text-foreground"
            )} style={{ fontFamily: 'var(--font-display)' }}>
              Garuda Fireworks
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-bold transition-all hover:text-secondary relative py-2",
                  isScrolled
                    ? "text-muted-foreground"
                    : darkMode
                      ? "text-foreground lg:text-white/80 lg:hover:text-white"
                      : "text-foreground/80 hover:text-foreground",
                  location === link.href &&
                    (isScrolled
                      ? "text-secondary scale-105"
                      : darkMode
                        ? "text-foreground lg:text-white scale-105"
                        : "text-secondary scale-105")
                )}
              >
                {link.name}
                {location === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full shadow-[0_0_8px_rgba(248,198,61,0.6)]"
                  />
                )}
              </Link>
            ))}
            
            <Link href="/cart" className="relative group">
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isScrolled
                  ? "bg-muted text-foreground"
                  : darkMode
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-muted text-foreground hover:bg-muted/80"
              )}>
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "p-2 rounded-full transition-all duration-300",
                isScrolled
                  ? "bg-muted text-foreground"
                  : darkMode
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-muted text-foreground hover:bg-muted/80"
              )}
              title="Toggle theme"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <a
              href="https://wa.me/919952053009"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full font-bold bg-secondary text-secondary-foreground shadow-[0_0_20px_-5px_rgba(248,198,61,0.5)] hover:shadow-[0_0_30px_-5px_rgba(248,198,61,0.7)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              Contact Us
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className={cn(
              "md:hidden p-2 rounded-lg",
              isScrolled ? "text-foreground" : "text-foreground"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-border/50 overflow-hidden"
          >
            <div className="flex flex-col px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-semibold px-4 py-3 rounded-xl transition-colors",
                    location === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="text-lg font-semibold px-4 py-3 rounded-xl transition-colors text-foreground hover:bg-muted"
              >
                {darkMode ? "Light mode" : "Dark mode"}
              </button>
              <div className="pt-4 mt-2 border-t border-border/50">
                <a
                  href="https://wa.me/919952053009"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-6 py-4 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/25"
                >
                  Contact on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
