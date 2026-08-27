import crypto from "crypto";
import { paymentService } from "@/server/services/payment.service";

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const body = await req.text();

  if (secret) {
    const signature = req.headers.get("x-razorpay-signature");
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (!signature || signature !== expected) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  try {
    const payload = JSON.parse(body);
    await paymentService.handleRazorpayWebhook(payload);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
