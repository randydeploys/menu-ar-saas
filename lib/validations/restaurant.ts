// lib/validations/restaurant.ts
import { z } from 'zod';

/**
 * 🎯 Validation stricte pour la création de restaurant
 *
 * Principes appliqués :
 * 1. Pas de `.or(z.literal(''))` -> utiliser `.nullish()` pour les champs optionnels
 * 2. Le slug n'est JAMAIS fourni par l'utilisateur en création (auto-généré)
 * 3. Transformation automatique des chaînes vides en null
 * 4. Validation métier stricte (format téléphone, URL, hex color) UNIQUEMENT si rempli
 */

// ==================
// HELPERS
// ==================

/**
 * Chaîne optionnelle avec limite de longueur
 * Transforme les chaînes vides en null
 */
const optionalString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Trop long (max ${maxLength} caractères)`)
    .transform((val) => (val === '' ? null : val))
    .nullish();

/**
 * Téléphone optionnel
 * - Si vide ou null/undefined → null (PAS D'ERREUR)
 * - Si rempli → validation du format
 */
const optionalPhone = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val))
  .nullish()
  .refine(
    (val) => {
      if (!val) return true; // null/undefined/vide → OK
      return /^[\d\s\-\+\(\)]+$/.test(val);
    },
    {
      message: 'Format de téléphone invalide (chiffres, espaces, +, -, parenthèses uniquement)',
    }
  );

/**
 * URL optionnelle
 * - Si vide ou null/undefined → null (PAS D'ERREUR)
 * - Si remplie → validation URL
 */
const optionalUrl = (errorMsg: string) =>
  z
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val))
    .nullish()
    .refine(
      (val) => {
        if (!val) return true; // null/undefined/vide → OK
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: errorMsg }
    );

/**
 * Couleur hexadécimale optionnelle
 * - Si vide ou null/undefined → null (PAS D'ERREUR)
 * - Si remplie → validation hex
 */
const optionalHexColor = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val))
  .nullish()
  .refine(
    (val) => {
      if (!val) return true; // null/undefined/vide → OK
      return /^#[0-9a-fA-F]{6}$/.test(val);
    },
    {
      message: 'Couleur invalide (format hexadécimal requis, ex: #FF5733)',
    }
  );

// ==================
// CREATE
// ==================
export const createRestaurantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom ne peut pas être vide')
    .max(255, 'Le nom est trop long (max 255 caractères)'),

  description: optionalString(1000),
  address: optionalString(255),
  city: optionalString(100),
  country: optionalString(100),

  // ✅ Optionnels sans validation si vides
  phone: optionalPhone,
  website: optionalUrl('URL du site web invalide'),
  logoUrl: optionalUrl('URL du logo invalide'),

  primaryColor: optionalHexColor,
});

// ==================
// UPDATE
// ==================
/**
 * En modification, tous les champs deviennent optionnels
 * Le slug ne peut PAS être modifié manuellement
 */
export const updateRestaurantSchema = createRestaurantSchema.partial();

// ==================
// DELETE (archive)
// ==================
export const deleteRestaurantSchema = z.object({
  id: z.string().cuid('ID de restaurant invalide'),
});

// ==================
// TYPES
// ==================
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type DeleteRestaurantInput = z.infer<typeof deleteRestaurantSchema>;

/**
 * Type pour les données de restaurant renvoyées par la DB
 * (utile pour le typage des composants)
 */
export type RestaurantData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  ownerId: string;
};

/**
 * Type pour la liste des restaurants (avec counts)
 */
export type RestaurantListItem = Omit<RestaurantData, 'archivedAt' | 'ownerId'> & {
  _count: {
    menus: number;
    dishes: number;
  };
};