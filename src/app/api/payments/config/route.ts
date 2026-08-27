import { isRazorpayConfigured } from "@/lib/payments";

export async function GET() {
  return Response.json({
    razorpayEnabled: isRazorpayConfigured(),
    currency: "INR",
    country: "IN",
  });
}
