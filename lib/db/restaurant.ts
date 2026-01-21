// lib/db/restaurant.ts
import prisma from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/utils/slug';
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
  RestaurantData,
  RestaurantListItem,
} from '@/lib/validations/restaurant';

/**
 * 🎯 Couche d'accès aux données pour les restaurants
 * 
 * Principes appliqués :
 * 1. Toutes les fonctions vérifient l'ownership (sécurité)
 * 2. Select explicites pour éviter l'overfetching
 * 3. Gestion d'erreurs claire avec messages métier
 * 4. Transactions atomiques pour les opérations critiques
 * 5. Soft-delete par défaut (archivage)
 */

// ==================
// CREATE
// ==================
/**
 * Crée un nouveau restaurant
 * - Génère automatiquement un slug unique
 * - Transaction atomique
 * 
 * @throws Error si la génération de slug échoue
 */
export async function createRestaurant(
  userId: string,
  input: CreateRestaurantInput
): Promise<Pick<RestaurantData, 'id' | 'name' | 'slug' | 'createdAt'>> {
  // Générer le slug automatiquement
  const slug = await generateUniqueSlug(input.name, userId);

  // Créer le restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      country: input.country ?? null,
      phone: input.phone ?? null,
      website: input.website ?? null,
      logoUrl: input.logoUrl ?? null,
      primaryColor: input.primaryColor ?? null,
      ownerId: userId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
    },
  });

  return restaurant;
}

// ==================
// READ (LIST)
// ==================
/**
 * Récupère tous les restaurants d'un utilisateur
 * 
 * @param userId - ID de l'utilisateur
 * @param includeArchived - Inclure les restaurants archivés (défaut: false)
 * 
 * @returns Liste des restaurants avec counts de menus/plats
 */
export async function getRestaurantsByUserId(
  userId: string,
  includeArchived: boolean = false
): Promise<RestaurantListItem[]> {
  const restaurants = await prisma.restaurant.findMany({
    where: {
      ownerId: userId,
      ...(includeArchived ? {} : { archivedAt: null }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      city: true,
      country: true,
      phone: true,
      website: true,
      logoUrl: true,
      primaryColor: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          menus: true,
          dishes: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return restaurants;
}

// ==================
// READ (SINGLE)
// ==================
/**
 * Récupère un restaurant spécifique avec vérification d'ownership
 * 
 * @throws Error si le restaurant n'existe pas
 * @throws Error si l'utilisateur n'est pas le propriétaire
 */
export async function getRestaurant(
  id: string,
  userId: string
): Promise<RestaurantData> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      city: true,
      country: true,
      phone: true,
      website: true,
      logoUrl: true,
      primaryColor: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      ownerId: true,
    },
  });

  if (!restaurant) {
    throw new Error('Restaurant non trouvé');
  }

  if (restaurant.ownerId !== userId) {
    throw new Error('Accès non autorisé à ce restaurant');
  }

  return restaurant;
}

/**
 * Récupère un restaurant par son slug (pour les pages publiques)
 * 
 * @param slug - Slug du restaurant
 * @param userId - ID du propriétaire
 * 
 * @returns Restaurant ou null si non trouvé
 */
export async function getRestaurantBySlug(
  slug: string,
  userId: string
): Promise<RestaurantData | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      ownerId_slug: {
        ownerId: userId,
        slug,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      city: true,
      country: true,
      phone: true,
      website: true,
      logoUrl: true,
      primaryColor: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
      ownerId: true,
    },
  });

  return restaurant;
}

// ==================
// UPDATE
// ==================
/**
 * Met à jour un restaurant
 * - Vérifie l'ownership
 * - Ne permet PAS de modifier le slug directement
 * 
 * @throws Error si le restaurant n'existe pas ou pas d'accès
 */
export async function updateRestaurant(
  id: string,
  userId: string,
  input: UpdateRestaurantInput
): Promise<Pick<RestaurantData, 'id' | 'name' | 'slug' | 'updatedAt'>> {
  // Vérifier l'ownership
  await getRestaurant(id, userId);

  // Mettre à jour
  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description ?? null }),
      ...(input.address !== undefined && { address: input.address ?? null }),
      ...(input.city !== undefined && { city: input.city ?? null }),
      ...(input.country !== undefined && { country: input.country ?? null }),
      ...(input.phone !== undefined && { phone: input.phone ?? null }),
      ...(input.website !== undefined && { website: input.website ?? null }),
      ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl ?? null }),
      ...(input.primaryColor !== undefined && { primaryColor: input.primaryColor ?? null }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      updatedAt: true,
    },
  });

  return restaurant;
}

// ==================
// DELETE (SOFT)
// ==================
/**
 * Archive un restaurant (soft-delete)
 * - Marque comme archivé sans supprimer les données
 * - Les menus/plats restent intacts
 * 
 * @throws Error si le restaurant n'existe pas ou pas d'accès
 */
export async function archiveRestaurant(
  id: string,
  userId: string
): Promise<Pick<RestaurantData, 'id' | 'name'>> {
  // Vérifier l'ownership
  await getRestaurant(id, userId);

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: { archivedAt: new Date() },
    select: {
      id: true,
      name: true,
    },
  });

  return restaurant;
}

/**
 * Restaure un restaurant archivé
 * 
 * @throws Error si le restaurant n'existe pas ou pas d'accès
 */
export async function unarchiveRestaurant(
  id: string,
  userId: string
): Promise<Pick<RestaurantData, 'id' | 'name'>> {
  // Vérifier l'ownership
  await getRestaurant(id, userId);

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: { archivedAt: null },
    select: {
      id: true,
      name: true,
    },
  });

  return restaurant;
}

// ==================
// DELETE (HARD)
// ==================
/**
 * Supprime définitivement un restaurant
 * 
 * ⚠️ DESTRUCTIF - Supprime tous les menus, plats, et données associées
 * À réserver aux admins ou avec confirmation explicite
 * 
 * @throws Error si le restaurant n'existe pas ou pas d'accès
 */
export async function deleteRestaurant(
  id: string,
  userId: string
): Promise<Pick<RestaurantData, 'id' | 'name'>> {
  // Vérifier l'ownership
  await getRestaurant(id, userId);

  // Cascade delete géré par Prisma
  const restaurant = await prisma.restaurant.delete({
    where: { id },
    select: {
      id: true,
      name: true,
    },
  });

  return restaurant;
}

// ==================
// UTILS
// ==================
/**
 * Compte le nombre de restaurants d'un utilisateur
 * Utile pour les limites de plan (Free vs Pro)
 */
export async function countUserRestaurants(userId: string): Promise<number> {
  return prisma.restaurant.count({
    where: {
      ownerId: userId,
      archivedAt: null,
    },
  });
}

/**
 * Vérifie si un utilisateur a atteint sa limite de restaurants
 * (à implémenter selon ta logique de billing)
 */
export async function canCreateRestaurant(
  userId: string,
  userPlan: 'Free' | 'Pro'
): Promise<{ allowed: boolean; reason?: string }> {
  const count = await countUserRestaurants(userId);
  
  const limits = {
    Free: 3,
    Pro: 999, // Unlimited ou une limite haute
  };

  const limit = limits[userPlan];

  if (count >= limit) {
    return {
      allowed: false,
      reason: userPlan === 'Free' 
        ? 'Limite atteinte. Passez à Pro pour créer plus de restaurants.'
        : 'Limite maximale atteinte.',
    };
  }

  return { allowed: true };
}