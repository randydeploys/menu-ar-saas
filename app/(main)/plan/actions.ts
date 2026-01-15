"use server";

import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth-server";

export async function createCheckoutSession(formData: FormData) {
  const priceId = String(formData.get("priceId") ?? "");
  if (!priceId) throw new Error("Missing priceId");

  // 🔒 Block Free plan checkout
  if (priceId === process.env.STRIPE_PRICE_ID_FREE) {
    redirect("/plan"); // ou throw new Error("Free plan does not require checkout")
  }

  const plan = priceId === process.env.STRIPE_PRICE_ID_PRO ? "Pro" : "Free";

  const user = await getUser();
  const stripeCheckout = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items: [{ price: priceId, quantity: 1 }],
  metadata: {
    plan: plan,
    userId: user.id,
  },
  mode: "subscription",
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/plan?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plan?cancel=true`,
  customer: user.stripeCustomerId!,
});
  if(!stripeCheckout.url){
    throw new Error("Stripe checkout url not found");
  }
  redirect(stripeCheckout.url);
}