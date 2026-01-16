"use server";

import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth-server";

export async function createCheckoutSession(formData: FormData) {
  const priceId = String(formData.get("priceId") ?? "");
  if (!priceId) throw new Error("Missing priceId");

  // Free => pas de checkout Stripe
  if (priceId === process.env.STRIPE_PRICE_ID_FREE) {
    redirect("/plan");
  }

  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // ✅ créer customer si nécessaire
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const stripeCheckout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    metadata: {
      plan: "Pro",
      userId: user.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/plan?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plan?cancel=true`,
  });

  if (!stripeCheckout.url) throw new Error("Stripe checkout url not found");
  redirect(stripeCheckout.url);
}
