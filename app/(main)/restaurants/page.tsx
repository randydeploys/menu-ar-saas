import React from "react";
import { getUser } from "@/lib/auth-server";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { createRestaurant } from "./action";
import { RestaurantForm } from "./restaurant-form";

export default async function RestaurantsPage() {
  const user = await getUser();
  if (!user) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vous devez être connecté pour accéder à cette page.
        </p>
        <Link className="mt-4 inline-block underline" href="/login">
          Se connecter
        </Link>
      </main>
    );
  }

  const restaurants = await prisma.restaurant.findMany({
    where: { ownerId: user.id, archivedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      country: true,
      address: true,
      createdAt: true,
    },
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">Vos restaurants</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez vos restaurants, menus, plats et QR codes.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <div className="space-y-6">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurants/${restaurant.slug}`}
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
                <p className="text-sm text-gray-500">
                  {restaurant.address ? restaurant.address : "Address not provided"}
                </p>

              </div>
            </Link>
          ))}
        </div>
      </div>
      <RestaurantForm />
    </main>
  );
}
