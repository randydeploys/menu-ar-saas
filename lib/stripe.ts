import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing in environment variables");
}

if (!stripeSecretKey.startsWith("sk_")) {
  throw new Error("Invalid STRIPE_SECRET_KEY format (must start with sk_)");
}

export const stripe = new Stripe(stripeSecretKey);
