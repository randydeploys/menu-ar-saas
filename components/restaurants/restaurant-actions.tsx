// components/restaurants/restaurant-actions.tsx
'use client';

import { useState } from 'react';
import { Copy, ExternalLink, QrCode, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RestaurantData } from '@/lib/validations/restaurant';

/**
 * 🎯 Actions rapides pour le restaurant
 * 
 * - Copier lien public
 * - Voir le menu public
 * - Générer QR code
 * - Partager
 */

interface RestaurantActionsProps {
  restaurant: Pick<RestaurantData, 'id' | 'name' | 'slug'>;
}

export function RestaurantActions({ restaurant }: RestaurantActionsProps) {
  const [copied, setCopied] = useState(false);

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${restaurant.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Lien copié', {
        description: 'Le lien public a été copié dans le presse-papier',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: `Découvrez ${restaurant.name}`,
          url: publicUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
        <CardDescription>
          Gérez et partagez votre restaurant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleCopyLink}>
            {copied ? (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copier le lien
              </>
            )}
          </Button>

          <Button variant="outline" asChild>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir en public
            </a>
          </Button>

          <Button variant="outline" disabled>
            <QrCode className="mr-2 h-4 w-4" />
            Générer QR Code
          </Button>

          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
        </div>

        {/* Lien public */}
        <div className="mt-4 rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground mb-1">
            Lien public de votre restaurant :
          </p>
          <code className="text-sm break-all">
            {publicUrl}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}