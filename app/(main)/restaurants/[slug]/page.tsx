import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";



export default async function RestaurantPage({
  params,
}: {
  params: { slug: string };
}) {  const { slug } = await params;

  const user = await getUser();
  if (!user) notFound();

  // TODO: Fetch restaurant data from your database/API
  // const restaurant = await getRestaurant(id);
  // if (!restaurant) notFound();

   const restaurant = await prisma.restaurant.findFirst({
    where: { slug, ownerId: user.id },
    select: {
      id: true,
      name: true,
      slug: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!restaurant) notFound();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Restaurant {restaurant.name}</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Menu Items</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total items in catalog</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">AR Models</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active 3D visualizations</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Status</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Publicly visible</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Restaurant Configuration</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Name</span>
              <span className="col-span-3 text-sm text-muted-foreground italic">Loading restaurant name...</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Location</span>
              <span className="col-span-3 text-sm text-muted-foreground italic">Loading address...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
