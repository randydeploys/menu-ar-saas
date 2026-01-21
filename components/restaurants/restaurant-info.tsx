// components/restaurants/restaurant-info.tsx
'use client';

import { useState } from 'react';
import { MapPin, Phone, Globe, Palette, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RestaurantForm } from '../restaurant-form';
import type { RestaurantData } from '@/lib/validations/restaurant';

/**
 * 🎯 Informations détaillées du restaurant
 * 
 * Mode lecture seule OU édition (via prop editable)
 */

interface RestaurantInfoProps {
  restaurant: RestaurantData;
  editable?: boolean;
}

export function RestaurantInfo({ restaurant, editable = false }: RestaurantInfoProps) {
  const [isEditing, setIsEditing] = useState(editable);

  // Mode édition
  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Modifier les informations</CardTitle>
          <CardDescription>
            Mettez à jour les détails de votre restaurant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RestaurantForm
            restaurant={restaurant}
            onSuccess={() => {
              setIsEditing(false);
              window.location.reload(); // Rafraîchir pour voir les changements
            }}
          />
        </CardContent>
      </Card>
    );
  }

  // Mode lecture
  const infoSections = [
    {
      title: 'Localisation',
      icon: MapPin,
      items: [
        { label: 'Adresse', value: restaurant.address },
        { label: 'Ville', value: restaurant.city },
        { label: 'Pays', value: restaurant.country },
      ].filter((item) => item.value),
    },
    {
      title: 'Contact',
      icon: Phone,
      items: [
        { label: 'Téléphone', value: restaurant.phone },
        { label: 'Site web', value: restaurant.website, isLink: true },
      ].filter((item) => item.value),
    },
    {
      title: 'Branding',
      icon: Palette,
      items: [
        { label: 'Logo', value: restaurant.logoUrl, isLink: true },
        { label: 'Couleur', value: restaurant.primaryColor, isColor: true },
      ].filter((item) => item.value),
    },
  ].filter((section) => section.items.length > 0);

  // Aucune info
  if (infoSections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>
            Détails de votre restaurant
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Aucune information supplémentaire
          </p>
          {!editable && (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Ajouter des informations
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {infoSections.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label}>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  {item.isLink ? (
                    <a
                      href={item.value as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {item.value}
                    </a>
                  ) : item.isColor ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ backgroundColor: item.value as string }}
                      />
                      <code className="text-sm">{item.value}</code>
                    </div>
                  ) : (
                    <p className="text-sm">{item.value}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}