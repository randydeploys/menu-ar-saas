// components/restaurants/restaurant-header.tsx
'use client';

import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { RestaurantData } from '@/lib/validations/restaurant';

interface RestaurantHeaderProps {
  restaurant: Pick<RestaurantData, 'id' | 'name' | 'slug' | 'description'>;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Bouton retour */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/restaurants')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux restaurants
      </Button>

      {/* Titre et actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {restaurant.name}
          </h1>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono text-xs">
              {restaurant.slug}
            </Badge>
          </div>

          {restaurant.description && (
            <p className="text-muted-foreground max-w-2xl">
              {restaurant.description}
            </p>
          )}
        </div>

        <Button asChild>
          <Link href={`/restaurants/${restaurant.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>
    </div>
  );
}