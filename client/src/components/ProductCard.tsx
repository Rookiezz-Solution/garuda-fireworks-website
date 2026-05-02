import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Tag, Plus, Minus } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { ApiProduct } from "@/hooks/use-products";
import { StableImage } from "./StableImage";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getImageUrl(product: any): string | null {
  if (product?.images?.length > 0) {
    const url = product.images[0].imageUrl;
    if (url?.startsWith?.("http")) return url;
    return `${API_URL}${url}`;
  }
  if (product?.image) return product.image;
  return null; // null → StableImage renders a div, no network request
}

function getDisplayPrice(product: ApiProduct) {
  const value = product.offerPrice ?? product.actualPrice;
  return Number(value);
}

interface ProductCardProps {
  product: ApiProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();
  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasInCart = quantity > 0;
    addToCart(product);
    if (!wasInCart) {
      toast({
        title: "Added to Cart!",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity <= 1) {
      removeFromCart(product.id);
      toast({
        title: "Removed from Cart",
        description: `${product.name} has been removed from your cart.`,
      });
      return;
    }
    updateQuantity(product.id, -1);
  };

  const imageSrc = getImageUrl(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex flex-col bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500"
    >
      <Link href={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <StableImage
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        <div className="absolute top-5 left-5 z-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary text-secondary-foreground shadow-xl">
            <Tag className="w-3 h-3" />
            {product.category?.name ?? "Uncategorized"}
          </span>
        </div>
      </Link>

      <div className="p-8 flex flex-col flex-grow relative z-10">
        <div className="flex justify-between items-start mb-4">
          <Link href={`/product/${product.id}`} className="block">
            <h3
              className="text-2xl font-black text-foreground group-hover:text-primary dark:group-hover:text-white transition-colors duration-300"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h3>
          </Link>
          <div className="flex flex-col items-end">
            {/* Yellow price — consistent in both light and dark mode */}
            <span className="text-xl font-black text-secondary">
              ₹{getDisplayPrice(product)}
            </span>
            {product.offerPrice ? (
              <span className="text-xs font-bold text-muted-foreground line-through">
                ₹{Number(product.actualPrice)}
              </span>
            ) : null}
          </div>
        </div>

        <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-2 mb-8 flex-grow">
          {product.description || "Sold per 1 Box"}
        </p>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-2xl bg-muted border border-border overflow-hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDecrease}
              disabled={quantity === 0}
              className="h-12 w-12 inline-flex items-center justify-center text-foreground disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </motion.button>
            <span className="w-10 text-center font-black text-foreground tabular-nums">
              {quantity}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleIncrease}
              className="h-12 w-12 inline-flex items-center justify-center bg-primary text-primary-foreground"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          <Link
            href={`/product/${product.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-card text-foreground font-bold border border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}