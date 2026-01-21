// app/(dashboard)/restaurants/[id]/page.tsx
import { redirect, notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getServerSession } from '@/lib/get-session';
import { getRestaurant } from '@/lib/db/restaurant';
import { RestaurantHeader } from '@/components/restaurants/restaurant-header';
import { RestaurantStats } from '@/components/restaurants/restaurant-stats';
import { RestaurantActions } from '@/components/restaurants/restaurant-actions';
import { RestaurantInfo } from '@/components/restaurants/restaurant-info';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * 🎯 Page de détails d'un restaurant (RSC)
 * 
 * Affiche :
 * - Header avec nom, slug, actions
 * - Statistiques (menus, plats, vues)
 * - Informations complètes
 * - Onglets : Vue d'ensemble | Menus | Paramètres
 */

interface RestaurantDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: RestaurantDetailPageProps) {
  const { id } = await params;
  
  try {
    const sessionData = await getServerSession();
    if (!sessionData?.user?.id) {
      return { title: 'Restaurant' };
    }

    const restaurant = await getRestaurant(id, sessionData.user.id);
    
    return {
      title: `${restaurant.name} | Mes Restaurants`,
      description: restaurant.description || `Gérer ${restaurant.name}`,
    };
  } catch {
    return { title: 'Restaurant' };
  }
}

export default async function RestaurantDetailPage({ 
  params 
}: RestaurantDetailPageProps) {
  const { id } = await params;

  // 1. Vérifier l'auth
  const sessionData = await getServerSession();

  if (!sessionData?.user?.id) {
    redirect('/sign-in');
  }

  const userId = sessionData.user.id;

  // 2. Récupérer le restaurant
  let restaurant;
  try {
    restaurant = await getRestaurant(id, userId);
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <RestaurantHeader restaurant={restaurant} />

      {/* Statistiques */}
      <Suspense fallback={<StatsSkeletons />}>
        <RestaurantStats restaurantId={id} />
      </Suspense>

      {/* Actions rapides */}
      <RestaurantActions restaurant={restaurant} />

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <RestaurantInfo restaurant={restaurant} />
        </TabsContent>

        {/* Menus */}
        <TabsContent value="menus">
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            <p>Gestion des menus à venir</p>
          </div>
        </TabsContent>

        {/* Paramètres */}
        <TabsContent value="settings">
          <RestaurantInfo restaurant={restaurant} editable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ==================
// SKELETONS
// ==================
function StatsSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}