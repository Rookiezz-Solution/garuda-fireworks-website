import { useCart } from "@/components/CartContext";
import { Link } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { StableImage } from "@/components/StableImage";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      /* Extra top padding so content clears the fixed navbar */
      <div className="container mx-auto px-4 pt-32 pb-20 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven't added any fireworks to your cart yet.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-full gap-2">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    /* pt-32 gives comfortable clearance below the fixed navbar */
    <div className="container mx-auto px-4 pt-32 pb-20">
      <h1 className="text-4xl font-extrabold mb-12">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-4 sm:p-6 overflow-hidden border-border/50">
                  <div className="flex gap-4 sm:gap-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-muted">
                      <StableImage
                        src={item.image ?? null}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:bg-destructive/10 -mt-2 -mr-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        {/* Yellow item total */}
                        <p className="text-xl font-bold text-secondary">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="p-8 border-border/50 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                {/* Yellow subtotal */}
                <span className="font-semibold text-secondary">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="text-xl font-bold">Total</span>
                {/* Yellow grand total */}
                <span className="text-3xl font-extrabold text-secondary">₹{totalPrice}</span>
              </div>
            </div>
            <div className="space-y-4">
              <Link href="/checkout">
                <Button className="w-full py-6 rounded-full text-lg font-bold gap-2 shadow-lg shadow-primary/20">
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" className="w-full py-6 rounded-full text-lg font-medium">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}