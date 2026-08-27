import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { toErrorResponse } from "@/server/errors/app-error";
import { rateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/server/services/email.service";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "register";
    const rl = rateLimit(`register:${ip}`, 10);
    if (!rl.success) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        cart: { create: {} },
      },
    });

    await sendVerificationEmail(email);

    return Response.json({
      id: user.id,
      email: user.email,
      message: "Account created. Check your email to verify.",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
