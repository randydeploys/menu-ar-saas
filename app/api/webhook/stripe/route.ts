import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth-server";
import { UserPlan } from "@/app/generated/prisma/enums";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
    const headerList = req.headers;
    const sig = headerList.get("stripe-signature");
    if (!sig) {
        return new Response("Invalid signature", { status: 400 });
    }
   
    let event: Stripe.Event;

    try {
        const body = await req.text();
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET ?? ""
        );
    } catch (error) {
        console.error("Error constructing event:", error);
        return new Response("Invalid event", { status: 400 });
    }

    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;

            const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
            const planFromMeta = session.metadata?.plan as UserPlan | undefined;
            
            if (!customerId) throw new Error("Missing customerId in session");
            if (!planFromMeta) throw new Error("Missing metadata.plan in session");

            const user = await prisma.user.findFirst({
                where: {
                    stripeCustomerId: customerId,
                },
            });
            if(!user){
                throw new Error("User not found");
            }
           await prisma.user.update({
          where: { id: user.id },
          data: { plan: planFromMeta },
        });
            break;
        default:
            break;
    }
    return new Response("Success", { status: 200 });
};