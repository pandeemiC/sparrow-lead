import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  const priceId =
    plan === "pro"
      ? process.env.STRIPE_PRO_PRICE_ID
      : plan === "growth"
        ? process.env.STRIPE_GROWTH_PRICE_ID
        : null;
  if (!priceId)
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const sql = getDb();
  const [user] =
    await sql`SELECT email, stripe_customer_id FROM users WHERE user_id = ${userId}`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: user?.stripe.customer_id || undefined,
    customer_email: user?.stripe_customer_id ? undefined : user?.email,
    metadata: { userId, plan },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}
