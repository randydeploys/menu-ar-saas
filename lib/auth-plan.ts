import { UserPlan } from "@/app/generated/prisma/enums";

export const LIMITATIONS: Record<UserPlan, {dataLimit: number }> = {
  Free: {
    dataLimit: 3,
  },
  Pro: {
    dataLimit: 1000,
  }
}