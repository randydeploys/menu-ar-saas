import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { createCheckoutSession } from "./actions";
import { getUser } from "@/lib/auth-server";
import { UserPlan } from "@/app/generated/prisma/enums";

// Prices are fresh for one hour max
export const revalidate = 3600;

type Plan = {
  name: "Free" | "Pro";
  priceCents: number;
  features: string[];
  priceId?: string; // uniquement pour Pro
  isPopular?: boolean;
  cta: string;
  description: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    priceCents: 0,
    description: "Test GastroView and publish a small menu.",
    features: [
      "1 restaurant",
      "20 dishes max",
      "Basic analytics (7 days)",
      "Standard QR code",
      "Community support",
    ],
    cta: "Free plan",
  },
  {
    name: "Pro",
    priceCents: 9900, // ✅ 99€ paiement unique
    description: "Lifetime access for professional restaurants.",
    features: [
      "Unlimited restaurants",
      "Unlimited dishes",
      "Advanced analytics (lifetime)",
      "Advanced dashboard",
      "Priority support",
      "Lifetime access (one-time payment)",
    ],
    priceId: process.env.STRIPE_PRICE_ID_PRO!, // ⚠️ price Stripe ONE-TIME
    cta: "Unlock Pro (99€)",
    isPopular: true,
  },
];

function formatEUR(priceCents: number) {
  return (priceCents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default async function PricingPage() {
  const user = await getUser();
  const currentUserPlan = user?.plan;

  return (
    <main className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Simple pricing, lifetime access
        </h1>
        <p className="mt-5 text-xl text-gray-500">
          One-time payment. No subscription. No hidden fees.
        </p>
        <p className="mt-5 text-sm text-gray-500">
          Ton plan actuel : <strong>{currentUserPlan}</strong>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            {...plan}
            currentUserPlan={currentUserPlan}
          />
        ))}
      </div>
    </main>
  );
}

function PricingCard({
  name,
  priceCents,
  features,
  priceId,
  isPopular = false,
  cta,
  description,
  currentUserPlan,
}: Plan & { currentUserPlan: UserPlan | undefined }) {
  const planKey = name === "Free" ? UserPlan.Free : UserPlan.Pro;
  const isCurrentPlan = currentUserPlan === planKey;
  const isUserPro = currentUserPlan === UserPlan.Pro;
  const isFreePlan = name === "Free";

  return (
    <div
      className={[
        "relative flex flex-col p-8 bg-white border rounded-2xl transition-all",
        isPopular || isCurrentPlan
          ? "border-orange-500 shadow-xl"
          : "border-gray-200 shadow-sm",
      ].join(" ")}
    >
      {isPopular && (
        <span className="absolute top-0 right-6 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Best value
        </span>
      )}

      <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
      <p className="mt-2 text-sm text-gray-600">{description}</p>

      <div className="mt-6 mb-6">
        <span className="text-4xl font-extrabold text-gray-900">
          {priceCents === 0 ? "Free" : formatEUR(priceCents)}
        </span>
        {priceCents > 0 && (
          <span className="ml-2 text-gray-500 text-sm">one-time</span>
        )}
      </div>

      <ul className="flex-1 space-y-4 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mt-0.5" />
            <p className="ml-3 text-gray-700">{feature}</p>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrentPlan ? (
        <Button className="w-full" variant="secondary" disabled>
          Current plan
        </Button>
      ) : isFreePlan ? (
        <Button className="w-full" variant="outline" disabled={isUserPro}>
          {isUserPro ? "Included in Pro" : "Free plan"}
        </Button>
      ) : (
        <form action={createCheckoutSession}>
          <input type="hidden" name="priceId" value={priceId} />
          <Button type="submit" className="w-full">
            {cta}
          </Button>
        </form>
      )}
    </div>
  );
}
