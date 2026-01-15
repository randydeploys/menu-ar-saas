import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { createCheckoutSession } from "./actions";
import { getUser } from "@/lib/auth-server";
import { UserPlan } from "@/app/generated/prisma/enums";

// Prices are fresh for one hour max
export const revalidate = 3600;

type Plan = {
  name: string;
  priceCents: number;
  interval: "month";
  trialDays: number;
  features: string[];
  priceId?: string;
  isPopular?: boolean;
  cta: string;
  description: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    priceCents: 0,
    interval: "month",
    trialDays: 0,
    description: "Test GastroView and publish a small menu.",
    features: [
      "1 restaurant",
      "20 dishes max",
      "Basic analytics (7 days)",
      "Standard QR code",
      "Community support",
    ],
    priceId: process.env.STRIPE_PRICE_ID_FREE!,
    cta: "Start for free",
  },

  {
    name: "Pro",
    priceCents: 5000,
    interval: "month",
    trialDays: 7,
    description: "For growing businesses and small groups.",
    features: [
      "3 restaurants",
      "Unlimited dishes",
      "Analytics (90 days)",
      "Advanced dashboard",
      "Priority support",
    ],
    priceId: process.env.STRIPE_PRICE_ID_PRO!,
    cta: "Go Pro",
  },
];

function formatEUR(priceCents: number) {
  const euros = priceCents / 100;
  return euros.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function PricingPage() {
    const user = await getUser();
    const currentUserPlan = user?.plan;
    console.log(user)
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
          Pricing built for restaurants
        </h1>
        <p className="mt-5 text-xl text-gray-500">
          Publish your menu in 3D/AR, generate a QR code, and track engagement.
        </p>
        <p className="mt-5 text-xl text-gray-500">
          Ton plan : {currentUserPlan}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {plans.map((plan) => (
          <PricingCard key={plan.name} {...plan} currentUserPlan={currentUserPlan}/>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-gray-500">
        VAT may apply. Cancel anytime.
      </p>
    </main>
  );
}

function PricingCard({
  name,
  priceCents,
  interval,
  trialDays,
  features,
  priceId,
  isPopular = false,
  cta,
  description,
  currentUserPlan,
}: Plan & { currentUserPlan: UserPlan | undefined }) {
  const priceLabel = priceCents === 0 ? "Free" : formatEUR(priceCents);
  const isFree = priceCents === 0;
  const isCurrentPlan = currentUserPlan === name;
  return (
    <div
      className={[
        "relative flex flex-col p-8 bg-white border rounded-2xl transition-all duration-200",
        isPopular || isCurrentPlan
          ? "border-orange-500 shadow-xl md:scale-[1.03] z-10"
          : "border-gray-200 shadow-sm hover:shadow-md",
      ].join(" ")}
    >
      {isPopular && (
        <div className="absolute top-0 right-8 -translate-y-1/2">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-orange-500 text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>

        {trialDays > 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            Includes a {trialDays}-day free trial
          </p>
        ) : (
          <p className="mt-3 text-sm text-gray-500">No credit card required</p>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-extrabold text-gray-900">
            {priceLabel}
          </span>
          {priceCents !== 0 && (
            <span className="text-base font-medium text-gray-500">
              /{interval}
            </span>
          )}
        </div>
      </div>

      <ul className="flex-1 space-y-4 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mt-0.5" />
            <p className="ml-3 text-base text-gray-700">{feature}</p>
          </li>
        ))}
      </ul>

       {isCurrentPlan ? (
        <Button className="w-full" variant="secondary" disabled>
          Current plan
        </Button>
      ) : (
        <form action={createCheckoutSession}>
          <input type="hidden" name="priceId" value={priceId ?? ""} />
          <Button type="submit" className="w-full">
            {cta}
          </Button>
        </form>
      )}
    </div>
  );
}
