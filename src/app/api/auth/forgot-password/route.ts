import { NextRequest } from "next/server";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/server/services/email.service";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "forgot";
  if (!rateLimit(`forgot:${ip}`, 5).success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
  const { email } = schema.parse(await req.json());
  await sendPasswordResetEmail(email.toLowerCase());
  return Response.json({ success: true });
}
