// app/(dashboard)/restaurants/new/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/get-session';
import { RestaurantForm } from '@/components/restaurant-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * 🎯 Page de création d'un nouveau restaurant
 */

export const metadata = {
  title: 'Nouveau Restaurant | Menu Digital',
  description: 'Créez un nouveau restaurant',
};

export default async function NewRestaurantPage() {
  // Vérifier l'auth
  const sessionData = await getServerSession();

  if (!sessionData?.user?.id) {
    redirect('/sign-in');
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
      <RestaurantForm />
    </div>
  );
}
