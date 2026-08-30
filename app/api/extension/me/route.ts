export const runtime = 'nodejs';
import { getEmailFromToken } from "@/lib/verify-codes";
import { getUserByEmail } from "@/models/User";
import { getSubscriptionByUserId } from "@/models/UserSubscription";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-extension-token",
    },
  });
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("x-extension-token");
    if (!token) {
      return NextResponse.json({ verified: false });
    }

    const email = await getEmailFromToken(token);
    if (!email) {
      return NextResponse.json({ verified: false });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ verified: false });
    }

    let plan = "free";
    try {
      const sub = await getSubscriptionByUserId(user.id);
      if (sub?.plan && sub.status === "active") plan = sub.plan;
    } catch {
      // Non-critical: default to free
    }

    return NextResponse.json({
      verified: true,
      email: user.email,
      name: user.name,
      plan,
    });
  } catch {
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
