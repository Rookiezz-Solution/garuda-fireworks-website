import { useParams } from "wouter";
import { motion } from "framer-motion";
import { ShieldAlert, Tag, ArrowLeft, Send, ShoppingCart, Check } from "lucide-react";
import { Link } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { Loader } from "@/components/Loader";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StableImage } from "@/components/StableImage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getImageUrl(product: any): string | null {
  if (product?.images?.length > 0) {
    const url = product.images[0].imageUrl;
    if (url?.startsWith?.("http")) return url;
    return `${API_URL}${url}`;
  }
  if (product?.image) return product.image;
  return null;
}

function getDisplayPrice(product: any) {
  return Number(product?.offerPrice ?? product?.actualPrice ?? 0);
}

export default function ProductDetails() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isAdded, setIsAdded] = useState(false);

  const { data: product, isLoading } = useProduct(id);

  if (isLoading) return <Loader />;

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The firework you're looking for doesn't exist.
        </p>
        <Link href="/products" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    toast({
      title: "Added to Cart!",
      description: `${product.name} added. Checkout to order on WhatsApp.`,
    });
    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Garuda Fireworks, I'm interested in the product: ${product.name} (ID: ${product.id}).`,
  );
  const whatsappLink = `https://wa.me/919952053009?text=${whatsappMessage}`;
  const imageSrc = getImageUrl(product);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors mb-8 font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Collections
        </Link>

        <div className="bg-card rounded-[3rem] shadow-2xl shadow-black/5 border border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative bg-muted aspect-square lg:aspect-auto min-h-[320px]">
              {imageSrc ? (
                <motion.div
                  className="w-full h-full"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <StableImage
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
              <div className="absolute top-8 left-8">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest bg-secondary shadow-xl text-secondary-foreground">
                  <Tag className="w-4 h-4" />
                  {product.category?.name ?? "Uncategorized"}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 lg:p-16 flex flex-col">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-grow"
              >
                <h1
                  className="text-5xl lg:text-6xl font-black mb-6 text-foreground leading-[1.1]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {product.name}
                </h1>

                {/* Yellow price — visible in both light and dark mode */}
                <div className="inline-block px-6 py-2 rounded-2xl bg-secondary/10 text-secondary text-4xl font-black mb-10">
                  ₹{getDisplayPrice(product)}
                </div>

                <div className="mb-12 text-muted-foreground font-medium leading-relaxed text-lg">
                  <p>{product.description || "Sold per 1 Box"}</p>
                </div>

                <div className="bg-muted border border-border rounded-[2rem] p-8 mb-12">
                  <div className="flex items-center gap-3 text-secondary font-black uppercase tracking-wider text-sm mb-4">
                    <ShieldAlert className="w-5 h-5" />
                    <h3>Safety Guidelines</h3>
                  </div>
                  <p className="text-foreground/80 font-medium leading-relaxed">
                    Always light fireworks outdoors, keep a safe distance, and follow label
                    instructions. Adult supervision required.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className="flex items-center justify-center gap-3 h-16 rounded-2xl font-black text-lg bg-foreground text-background hover:bg-foreground/90 transition-all duration-300"
                >
                  {isAdded ? <Check className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6" />}
                  {isAdded ? "Added" : "Add to Cart"}
                </Button>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-16 gap-3 rounded-2xl font-black text-lg bg-[#25D366] text-white shadow-xl shadow-[#25D366]/20 hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                  Direct Inquiry
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}