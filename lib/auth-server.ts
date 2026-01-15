import { getServerSession } from "./get-session";
import { LIMITATIONS } from "./auth-plan";
import { UserPlan } from "@/app/generated/prisma/enums";

export const getUser = async () => {
    const session = await getServerSession();
    const user = session?.user;
    if (!user) {
        throw new Error("User not found");
    }
    const limitations = LIMITATIONS[user.plan as UserPlan];
    return {
        ...user,
        limitations,
    }

}