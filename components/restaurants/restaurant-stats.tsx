// components/restaurants/restaurant-stats.tsx
import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Menu, Eye, QrCode } from 'lucide-react';

/**
 * 🎯 Statistiques du restaurant (RSC)
 * 
 * Affiche :
 * - Nombre de menus
 * - Nombre de plats
 * - Vues totales (si analytics implémentées)
 * - QR codes générés
 */

interface RestaurantStatsProps {
  restaurantId: string;
}

async function getRestaurantStats(restaurantId: string) {
  const [menuCount, dishCount, qrCodeCount] = await Promise.all([
    prisma.menu.count({
      where: { restaurantId, archivedAt: null },
    }),
    prisma.dish.count({
      where: { restaurantId, archivedAt: null },
    }),
    prisma.qrCode.count({
      where: { restaurantId, archivedAt: null },
    }),
  ]);

  return {
    menus: menuCount,
    dishes: dishCount,
    qrCodes: qrCodeCount,
    views: 0, // À implémenter avec analytics
  };
}

export async function RestaurantStats({ restaurantId }: RestaurantStatsProps) {
  const stats = await getRestaurantStats(restaurantId);

  const cards = [
    {
      title: 'Menus',
      value: stats.menus,
      icon: Menu,
      description: stats.menus > 1 ? 'menus actifs' : 'menu actif',
    },
    {
      title: 'Plats',
      value: stats.dishes,
      icon: UtensilsCrossed,
      description: stats.dishes > 1 ? 'plats au total' : 'plat au total',
    },
    {
      title: 'QR Codes',
      value: stats.qrCodes,
      icon: QrCode,
      description: stats.qrCodes > 1 ? 'codes générés' : 'code généré',
    },
    {
      title: 'Vues',
      value: stats.views,
      icon: Eye,
      description: 'vues ce mois',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}