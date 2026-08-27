import { Resend } from "resend";
import { randomBytes } from "crypto";
import { prisma } from "@/server/db/prisma";
import { siteConfig } from "@/config/site";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from = process.env.EMAIL_FROM ?? "Veloire <onboarding@resend.dev>";

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[DEV EMAIL] To: ${to} | ${subject}\n${html}`);
    return;
  }
  await resend.emails.send({ from, to, subject, html });
}

export async function sendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 86400_000 * 2);
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });
  const url = `${siteConfig.url}/account/verify-email?token=${token}`;
  await send(email, "Verify your Veloire account", `<p><a href="${url}">Verify email</a></p>`);
}

type OrderEmailData = {
  orderNumber: string;
  email: string;
  total: number;
  items: { productTitle: string; quantity: number; unitPrice: number }[];
  paymentLabel: string;
};

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (i) =>
        `<li>${i.productTitle} × ${i.quantity} — ₹${(i.unitPrice * i.quantity).toLocaleString("en-IN")}</li>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:520px">
      <h2>Thank you for your order</h2>
      <p>Order <strong>${data.orderNumber}</strong> is confirmed.</p>
      <p>Payment: ${data.paymentLabel}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total: ₹${data.total.toLocaleString("en-IN")}</strong></p>
      <p style="color:#666;font-size:13px">Prices inclusive of GST. We'll notify you when your order ships.</p>
      <p><a href="${siteConfig.url}/account/orders">View your orders</a></p>
    </div>
  `;

  await send(data.email, `Order confirmed — ${data.orderNumber}`, html);
}

export async function sendPasswordResetEmail(email: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt: new Date(Date.now() + 3600_000) },
  });
  const url = `${siteConfig.url}/account/reset-password?token=${token}`;
  await send(email, "Reset your password", `<p><a href="${url}">Reset password</a></p>`);
}
