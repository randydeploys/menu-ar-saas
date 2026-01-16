"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth-server";
import { UserPlan } from "@/app/generated/prisma/enums";

type CreateRestaurantInput = {
  name: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
};

type CreateRestaurantResult =
  | { ok: true; restaurant: { id: string; name: string; slug: string } }
  | { ok: false; code: "UNAUTHORIZED" | "INVALID_NAME" | "FREE_LIMIT" | "UNKNOWN"; message?: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function buildUniqueSlug(ownerId: string, base: string) {
  const baseSlug = slugify(base) || "restaurant";
  let slug = baseSlug;
  let i = 1;

  while (true) {
    const existing = await prisma.restaurant.findFirst({
      where: { ownerId, slug },
      select: { id: true },
    });
    if (!existing) return slug;
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
}

export async function createRestaurant(
  input: CreateRestaurantInput
): Promise<CreateRestaurantResult> {
  try {
    console.log("[createRestaurant] first");

    const user = await getUser();
    if (!user) return { ok: false, code: "UNAUTHORIZED" };

    console.log("[createRestaurant] second");

    const name = (input.name ?? "").trim();
    if (name.length < 2) return { ok: false, code: "INVALID_NAME" };

    console.log("[createRestaurant] third");

    // ✅ Free limit: count restaurants for this owner
    if (user.plan !== UserPlan.Pro) {
      let count: number;

      try {
        count = await prisma.restaurant.count({
          where: { ownerId: user.id }, // ✅ pas de archivedAt si ton modèle ne l’a pas
        });
      } catch (e) {
        console.error("[createRestaurant] count failed:", e);
        return { ok: false, code: "UNKNOWN", message: "COUNT_FAILED" };
      }

      console.log("[createRestaurant] count =", count);

      if (count >= 3) return { ok: false, code: "FREE_LIMIT" };
    }

    console.log("[createRestaurant] fourth");

    const slug = await buildUniqueSlug(user.id, name);

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        description: input.description?.trim() || null,
        address: input.address?.trim() || null,
        phone: input.phoneNumber?.trim() || null,
        ownerId: user.id,
      },
      select: { id: true, name: true, slug: true },
    });

    console.log("[createRestaurant] created", restaurant.id);

    return { ok: true, restaurant };
  } catch (e) {
    console.error("[createRestaurant] fatal error:", e);
    return { ok: false, code: "UNKNOWN", message: "FATAL" };
  }
}
