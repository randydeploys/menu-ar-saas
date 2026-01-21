// components/restaurants/restaurant-form.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  createRestaurantSchema,
  type CreateRestaurantInput,
  type RestaurantData,
} from '@/lib/validations/restaurant';


import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createRestaurantAction, updateRestaurantAction } from '@/lib/actions/restaurant';

/**
 * 🎯 Formulaire de création/modification de restaurant
 * 
 * Principes appliqués :
 * 1. React Hook Form + Zod pour validation côté client
 * 2. useTransition pour l'optimistic UI
 * 3. Gestion d'erreurs granulaire avec toast
 * 4. Champs vides transformés en null (pas de chaînes vides)
 * 5. Slug en lecture seule (jamais modifiable manuellement)
 * 6. UX optimisée : loading states, messages clairs
 */

interface RestaurantFormProps {
  restaurant?: Pick<
    RestaurantData,
    | 'id'
    | 'name'
    | 'slug'
    | 'description'
    | 'address'
    | 'city'
    | 'country'
    | 'phone'
    | 'website'
    | 'logoUrl'
    | 'primaryColor'
  >;
  onSuccess?: () => void;
}

export function RestaurantForm({ restaurant, onSuccess }: RestaurantFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!restaurant;
  const isLoading = isPending || isSubmitting;

  // Configuration du formulaire
  const form = useForm<CreateRestaurantInput>({
    resolver: zodResolver(createRestaurantSchema),
    defaultValues: {
      name: restaurant?.name ?? '',
      description: restaurant?.description ?? '',
      address: restaurant?.address ?? '',
      city: restaurant?.city ?? '',
      country: restaurant?.country ?? '',
      phone: restaurant?.phone ?? '',
      website: restaurant?.website ?? '',
      logoUrl: restaurant?.logoUrl ?? '',
      primaryColor: restaurant?.primaryColor ?? '#000000',
    },
  });

  // Soumission du formulaire
  const onSubmit = async (data: CreateRestaurantInput) => {
    setIsSubmitting(true);

    try {
      startTransition(async () => {
        let result;

        if (isEditing) {
          // Modification
          result = await updateRestaurantAction(restaurant.id, data);
        } else {
          // Création
          result = await createRestaurantAction(data);
        }

        if (!result.success) {
          // Erreur avec code
          const { error } = result;
          
          switch (error.code) {
            case 'AUTH':
              toast.error('Session expirée', {
                description: 'Veuillez vous reconnecter',
              });
              router.push('/sign-in');
              break;
            
            case 'LIMIT':
              toast.error('Limite atteinte', {
                description: error.message,
                action: {
                  label: 'Passer à Pro',
                  onClick: () => router.push('/plan'),
                },
              });
              break;
            
            case 'VALIDATION':
              toast.error('Erreur de validation', {
                description: error.message,
              });
              break;
            
            case 'PERMISSION':
              toast.error('Accès refusé', {
                description: error.message,
              });
              break;
            
            case 'NOT_FOUND':
              toast.error('Restaurant introuvable', {
                description: error.message,
              });
              router.push('/restaurants');
              break;
            
            default:
              toast.error('Erreur', {
                description: error.message,
              });
          }
          
          return;
        }

        // Succès
        toast.success(
          isEditing ? 'Restaurant modifié' : 'Restaurant créé',
          {
            description: `${result.data.name} (${result.data.slug})`,
          }
        );

        // Callback ou redirection
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/restaurants');
        }

        // Reset le formulaire en création uniquement
        if (!isEditing) {
          form.reset();
        }
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Erreur inattendue', {
        description: 'Veuillez réessayer',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Modifier le restaurant' : 'Nouveau restaurant'}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? 'Mettez à jour les informations de votre restaurant'
            : 'Créez un nouveau restaurant pour commencer'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nom (requis) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nom du restaurant <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Le Petit Bistrot"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Le nom public de votre restaurant
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug (lecture seule si édition) */}
            {isEditing && restaurant && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">
                  Identifiant unique (slug)
                </p>
                <code className="mt-1 block text-sm text-gray-900">
                  {restaurant.slug}
                </code>
                  <p className="mt-2 text-xs text-amber-700">
                    Le slug est généré automatiquement à la création et ne change pas.
                    Cela garantit la stabilité des URLs et des QR codes.
                  </p>
              </div>
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Cuisine française traditionnelle dans un cadre authentique..."
                      rows={4}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Une courte description de votre restaurant (max 1000 caractères)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adresse et Ville */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder="123 Rue de Rivoli"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder="Paris"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pays */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pays</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="France"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Téléphone et Site web */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder="+33 1 23 45 67 89"
                        type="tel"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder="https://example.com"
                        type="url"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Logo URL */}
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL du logo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="https://example.com/logo.png"
                      type="url"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Lien vers votre logo (format PNG ou SVG recommandé)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Couleur primaire */}
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couleur de marque</FormLabel>
                  <FormControl>
                    <div className="flex gap-3">
                      <Input
                        {...field}
                        value={field.value ?? '#000000'}
                        type="color"
                        className="h-10 w-20 cursor-pointer"
                        disabled={isLoading}
                      />
                      <Input
                        {...field}
                        value={field.value ?? '#000000'}
                        placeholder="#FF5733"
                        className="flex-1 font-mono"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Couleur principale pour votre menu digital
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Enregistrer' : 'Créer le restaurant'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
