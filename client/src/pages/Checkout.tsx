import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, ShoppingBag, ArrowLeft } from "lucide-react";
import { submitOrder, validateCoupon } from "@/api/publicApi";
import { StableImage } from "@/components/StableImage";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Full address is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  notes: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>("");

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: "", phone: "", address: "", city: "", pincode: "", notes: "" },
  });

  const finalTotal = Math.max(0, totalPrice - discountAmount);

  const buildWhatsAppMessage = (values: CheckoutValues) => {
    const address = `${values.address}, ${values.city} - ${values.pincode}`;
    const items = cart.map((i) => ({ name: i.name, qty: i.quantity, total: i.price * i.quantity }));
    return `🎆 *New Order - Garuda Fireworks* 🎆
👤 *Customer:* ${values.name}
📞 *Phone:* ${values.phone}
📍 *Address:* ${address}
🛒 *Items:*
${items.map((i) => `  • ${i.name} x${i.qty} = ₹${i.total}`).join("\n")}
💰 *Subtotal:* ₹${totalPrice}
🎟️ *Coupon:* ${appliedCoupon?.code || "None"}
💸 *Discount:* ₹${discountAmount}
✅ *Total:* ₹${finalTotal}`;
  };

  const onSubmit = async (values: CheckoutValues) => {
    try {
      await submitOrder({
        customerName: values.name,
        customerPhone: values.phone,
        customerEmail: null,
        deliveryAddress: `${values.address}\n${values.city} - ${values.pincode}`,
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity, price: item.price })),
        total: finalTotal,
        couponCode: appliedCoupon?.code || null,
        discount: discountAmount || 0,
      });
    } catch (err) {
      console.error("Order save failed:", err);
    } finally {
      const encodedMessage = encodeURIComponent(buildWhatsAppMessage(values));
      window.open(`https://wa.me/919952053009?text=${encodedMessage}`, "_blank");
      setShowSuccess(true);
    }
  };

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await validateCoupon({ code, orderTotal: totalPrice });
      const data = res.data?.data;
      setAppliedCoupon({ code: data.code, discountAmount: Number(data.discountAmount), finalTotal: Number(data.finalTotal) });
      setDiscountAmount(Number(data.discountAmount));
    } catch (e: any) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError(e?.response?.data?.message || e?.message || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleContinueShopping = () => {
    clearCart();
    setLocation("/products");
  };

  if (cart.length === 0 && !showSuccess) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-12 text-foreground">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Delivery form */}
            <div>
              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-bold mb-6">Delivery Information</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {[
                      { name: "name" as const, label: "Full Name", placeholder: "Enter your name", type: "input" },
                      { name: "phone" as const, label: "Phone Number", placeholder: "Enter your 10-digit number", type: "input" },
                    ].map(({ name, label, placeholder }) => (
                      <FormField
                        key={name}
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              <Input placeholder={placeholder} {...field} className="rounded-xl h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="House No, Street, Landmark" {...field} className="rounded-xl min-h-[100px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} className="rounded-xl h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="6-digit code" {...field} className="rounded-xl h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Special instructions for delivery" {...field} className="rounded-xl h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full py-6 rounded-full text-lg font-bold gap-2 mt-4">
                      Place Order via WhatsApp
                    </Button>
                  </form>
                </Form>
              </Card>
            </div>

            {/* Order summary */}
            <div>
              <Card className="p-8 border-border/50 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                {/* Coupon */}
                <div className="mb-6 rounded-2xl border border-border/50 bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="rounded-xl h-12"
                    />
                    <Button type="button" onClick={applyCoupon} disabled={applyingCoupon} className="rounded-xl h-12 px-6">
                      {applyingCoupon ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                  {appliedCoupon?.code && (
                    <div className="mt-3 text-sm text-green-600">
                      Applied {appliedCoupon.code} • Discount ₹{discountAmount}
                    </div>
                  )}
                  {couponError && <div className="mt-3 text-sm text-red-600">{couponError}</div>}
                </div>

                {/* Items list */}
                <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <StableImage
                            src={item.image ?? null}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm sm:text-base">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      {/* Yellow item total */}
                      <p className="font-bold text-secondary">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                {appliedCoupon ? (
                  <div className="space-y-1 border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold text-secondary">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{appliedCoupon.discountAmount}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span className="text-2xl font-bold text-secondary">₹{appliedCoupon.finalTotal}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-secondary">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold">Total Amount</span>
                      <span className="text-2xl font-bold text-secondary">₹{totalPrice}</span>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <Link href="/cart">
                    <Button variant="ghost" className="w-full rounded-full gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Cart
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Order Request Sent!</DialogTitle>
              <DialogDescription className="text-base">
                Your order request has been sent to Garuda Fireworks via WhatsApp. Our team will
                contact you shortly to confirm payment and delivery details.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full mt-8">
              <Button
                onClick={handleContinueShopping}
                className="w-full rounded-full py-6 text-lg font-bold gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}