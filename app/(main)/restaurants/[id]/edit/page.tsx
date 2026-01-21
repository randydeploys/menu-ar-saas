// app/(dashboard)/restaurants/[id]/page.tsx
import { redirect, notFound } from 'next/navigation';
import { getServerSession } from '@/lib/get-session';
import { getRestaurant, getRestaurantBySlug } from '@/lib/db/restaurant';
import { RestaurantForm } from '@/components/restaurant-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/** 
 * 🎯 Page d'édition d'un restaurant
 * 
 * Route dynamique : /restaurants/[id]
 */

interface RestaurantEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: RestaurantEditPageProps) {
  const { id } = await params;
  
  // On pourrait fetch le restaurant ici pour le titre
  // Mais pour simplifier, on utilise un titre générique
  return {
    title: 'Modifier le Restaurant | Menu Digital',
    description: 'Modifiez les informations de votre restaurant',
  };
}

export default async function RestaurantEditPage({ params }: RestaurantEditPageProps) {
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
    // Restaurant non trouvé ou pas d'accès
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 space-y-6">
      {/* Retour */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/restaurants">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux restaurants
        </Link>
      </Button>

      {/* Formulaire */}
      <RestaurantForm restaurant={restaurant} />
    </div>
  );
}
