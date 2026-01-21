// app/actions/restaurant.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSession } from '@/lib/get-session';
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  deleteRestaurantSchema,
} from '@/lib/validations/restaurant';
import {
  createRestaurant as dbCreate,
  updateRestaurant as dbUpdate,
  archiveRestaurant as dbArchive,
  deleteRestaurant as dbDelete,
  canCreateRestaurant,
} from '@/lib/db/restaurant';

/**
 * 🎯 Server Actions pour les restaurants
 * 
 * Principes appliqués :
 * 1. Validation auth systématique
 * 2. Validation Zod avec messages clairs
 * 3. Gestion d'erreurs granulaire (type + message)
 * 4. Cache invalidation précise
 * 5. Logs pour debugging (sans exposer de données sensibles)
 * 6. Types de retour cohérents
 */

// ==================
// TYPES DE RETOUR
// ==================
type ActionSuccess<T = unknown> = {
  success: true;
  data: T;
};

type ActionError = {
  success: false;
  error: {
    message: string;
    code: 'AUTH' | 'VALIDATION' | 'PERMISSION' | 'NOT_FOUND' | 'LIMIT' | 'UNKNOWN';
    details?: unknown;
  };
};

type ActionResult<T = unknown> = ActionSuccess<T> | ActionError;

// ==================
// HELPERS
// ==================
/**
 * Récupère la session avec gestion d'erreur
 */
async function requireAuth() {
  const sessionData = await getServerSession();

  if (!sessionData?.user?.id) {
    return {
      success: false as const,
      error: {
        message: 'Vous devez être connecté pour effectuer cette action',
        code: 'AUTH' as const,
      },
    };
  }

  return {
    success: true as const,
    user: sessionData.user,
  };
}

/**
 * Formate les erreurs Zod de manière lisible
 */
function formatZodError(error: z.ZodError): string {
  const firstError = error.errors[0];
  if (!firstError) return 'Erreur de validation';

  const field = firstError.path.join('.');
  return field 
    ? `${field}: ${firstError.message}`
    : firstError.message;
}

// ==================
// CREATE
// ==================
/**
 * Crée un nouveau restaurant
 * 
 * Workflow :
 * 1. Vérification auth
 * 2. Vérification limite plan (Free = 1, Pro = ∞)
 * 3. Validation Zod
 * 4. Création en DB (slug auto-généré)
 * 5. Invalidation cache
 */
export async function createRestaurantAction(
  input: unknown
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    // 1. Auth
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    const { user } = authResult;

    // 2. Vérifier la limite du plan
    const canCreate = await canCreateRestaurant(user.id, user.plan || 'Free');
    if (!canCreate.allowed) {
      return {
        success: false,
        error: {
          message: canCreate.reason || 'Limite de restaurants atteinte',
          code: 'LIMIT',
        },
      };
    }

    // 3. Validation Zod
    const validated = createRestaurantSchema.parse(input);

    // 4. Création
    const restaurant = await dbCreate(user.id, validated);

    // 5. Invalidation cache
    revalidatePath('/restaurants');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: restaurant,
    };
  } catch (error) {
    console.error('[createRestaurantAction] Error:', error);

    // Erreur de validation Zod
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: formatZodError(error),
          code: 'VALIDATION',
          details: error.errors,
        },
      };
    }

    // Erreur métier (DB)
    if (error instanceof Error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: 'UNKNOWN',
        },
      };
    }

    // Erreur inconnue
    return {
      success: false,
      error: {
        message: 'Une erreur inattendue est survenue',
        code: 'UNKNOWN',
      },
    };
  }
}

// ==================
// UPDATE
// ==================
/**
 * Met à jour un restaurant existant
 * 
 * Workflow :
 * 1. Vérification auth
 * 2. Validation Zod (partial)
 * 3. Update en DB (avec vérification ownership)
 * 4. Invalidation cache
 */
export async function updateRestaurantAction(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    // 1. Auth
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    const { user } = authResult;

    // 2. Validation
    const validated = updateRestaurantSchema.parse(input);

    // 3. Update (ownership check inside)
    const restaurant = await dbUpdate(id, user.id, validated);

    // 4. Invalidation cache
    revalidatePath('/restaurants');
    revalidatePath(`/restaurants/${id}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      data: restaurant,
    };
  } catch (error) {
    console.error('[updateRestaurantAction] Error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: formatZodError(error),
          code: 'VALIDATION',
          details: error.errors,
        },
      };
    }

    if (error instanceof Error) {
      // Distinguer les erreurs métier
      if (error.message.includes('non trouvé')) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        };
      }

      if (error.message.includes('non autorisé')) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'PERMISSION',
          },
        };
      }

      return {
        success: false,
        error: {
          message: error.message,
          code: 'UNKNOWN',
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Une erreur inattendue est survenue',
        code: 'UNKNOWN',
      },
    };
  }
}

// ==================
// DELETE (ARCHIVE)
// ==================
/**
 * Archive un restaurant (soft-delete)
 * 
 * Note : C'est la méthode par défaut recommandée
 * Pour un hard-delete, créer une action séparée avec confirmation
 */
export async function deleteRestaurantAction(
  id: string
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    // 1. Auth
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    const { user } = authResult;

    // 2. Archive
    const restaurant = await dbArchive(id, user.id);

    // 3. Invalidation cache
    revalidatePath('/restaurants');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: restaurant,
    };
  } catch (error) {
    console.error('[deleteRestaurantAction] Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        };
      }

      if (error.message.includes('non autorisé')) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'PERMISSION',
          },
        };
      }

      return {
        success: false,
        error: {
          message: error.message,
          code: 'UNKNOWN',
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Erreur lors de la suppression',
        code: 'UNKNOWN',
      },
    };
  }
}

// ==================
// HARD DELETE (ADMIN)
// ==================
/**
 * Supprime définitivement un restaurant
 * 
 * ⚠️ À utiliser avec précaution
 * Nécessite une confirmation explicite de l'utilisateur
 */
export async function permanentlyDeleteRestaurantAction(
  id: string
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    const { user } = authResult;

    const restaurant = await dbDelete(id, user.id);

    revalidatePath('/restaurants');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: restaurant,
    };
  } catch (error) {
    console.error('[permanentlyDeleteRestaurantAction] Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        };
      }

      if (error.message.includes('non autorisé')) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'PERMISSION',
          },
        };
      }

      return {
        success: false,
        error: {
          message: error.message,
          code: 'UNKNOWN',
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Erreur lors de la suppression définitive',
        code: 'UNKNOWN',
      },
    };
  }
}