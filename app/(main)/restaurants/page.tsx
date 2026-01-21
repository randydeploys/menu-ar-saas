// app/(dashboard)/restaurants/page.tsx
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getServerSession } from '@/lib/get-session';
import { getRestaurantsByUserId } from '@/lib/db/restaurant';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { RestaurantsTableSkeleton } from '@/components/restaurant-table-skeleton';
import { RestaurantsTable } from '@/components/data-table-restaurant';

/**
 * 🎯 Page liste des restaurants (React Server Component)
 * 
 * Principes appliqués :
 * 1. Server Component pour fetch côté serveur
 * 2. Suspense pour loading states
 * 3. Auth check avec redirect
 * 4. Metadata statique pour SEO
 * 5. Pas de client-side fetch (meilleure perf)
 */

export const metadata = {
  title: 'Mes Restaurants | Menu Digital',
  description: 'Gérez vos restaurants et menus digitaux',
};

export default async function RestaurantsPage() {
  // 1. Vérifier l'auth
  const sessionData = await getServerSession();

  if (!sessionData?.user?.id) {
    redirect('/sign-in');
  }

  const userId = sessionData.user.id;

  // 2. Fetch data côté serveur
  // Note : En production, wrap ceci dans un try/catch si besoin
  const restaurants = await getRestaurantsByUserId(userId);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Mes Restaurants
          </h1>
          <p className="text-muted-foreground mt-2">
            {restaurants.length === 0
              ? 'Aucun restaurant pour le moment'
              : `${restaurants.length} restaurant${restaurants.length > 1 ? 's' : ''}`}
          </p>
        </div>

        <Button asChild>
          <Link href="/restaurants/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau restaurant
          </Link>
        </Button>
      </div>

      {/* Table avec Suspense */}
      <Suspense fallback={<RestaurantsTableSkeleton  />}>
        <RestaurantsTable restaurants={restaurants} userId={userId} />
      </Suspense>

      {/* Empty state */}
      {restaurants.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">
              Aucun restaurant
            </h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Créez votre premier restaurant pour commencer à gérer vos menus digitaux.
            </p>
            <Button asChild>
              <Link href="/restaurants/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer mon premier restaurant
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
