import Stripe from "stripe";

let client: Stripe | null = null;

// created on first use, so the app builds and runs without stripe keys
// while paid plans are still coming soon. null means billing isn't set up
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
  });
  return client;
}
