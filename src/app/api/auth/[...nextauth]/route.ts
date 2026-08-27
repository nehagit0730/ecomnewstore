import { handlers } from "@/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    return await handlers.GET(req);
  } catch (error) {
    console.error("NextAuth GET route error:", error);
    // Return null session on error so client does not throw ClientFetchError
    if (req.nextUrl.pathname.endsWith("/session")) {
      return NextResponse.json(null, { status: 200 });
    }
    return NextResponse.json({ error: "Authentication service error" }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handlers.POST(req);
  } catch (error) {
    console.error("NextAuth POST route error:", error);
    return NextResponse.json({ error: "Authentication service error" }, { status: 200 });
  }
}

