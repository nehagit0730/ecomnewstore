import { CheckoutForm } from "@/components/checkout/checkout-form";
import { buildMetadata } from "@/lib/seo";
import { isRazorpayConfigured } from "@/lib/payments";

export const metadata = buildMetadata({
  title: "Checkout",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <h1 className="font-serif text-3xl md:text-4xl tracking-tight mb-8">Checkout</h1>
      <CheckoutForm razorpayEnabled={isRazorpayConfigured()} />
    </div>
  );
}
