// lib/utils/slug.ts
'use server';

import prisma from '@/lib/prisma';

/**
 * 🎯 Génération de slug optimisée et sécurisée
 * 
 * Principes :
 * 1. Un seul fichier pour éviter la duplication
 * 2. Fonction synchrone pour la transformation
 * 3. Fonction async pour la vérification d'unicité
 * 4. Protection contre les boucles infinies
 * 5. Scope par utilisateur (chaque user peut avoir "mon-restaurant")
 */

/**
 * Transforme une chaîne en slug valide (fonction helper synchrone)
 * - Lowercase
 * - Normalisation NFD + suppression des accents
 * - Suppression des caractères spéciaux
 * - Remplacement espaces par tirets
 * - Nettoyage des tirets multiples/début/fin
 * 
 * Note: Cette fonction est synchrone car c'est une pure transformation
 * Elle n'est pas exportée directement car utilisée uniquement en interne
 */
function transformToSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les marques diacritiques
    .replace(/[^\w\s-]/g, '') // Garde uniquement lettres, chiffres, espaces, tirets
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
    .replace(/^-+|-+$/g, ''); // Supprime les tirets en début/fin
}

/**
 * Version exportée async pour conformité Server Actions
 * Wraps la transformation synchrone dans une fonction async
 */
export async function createSlug(input: string): Promise<string> {
  return transformToSlug(input);
}

/**
 * Génère un slug unique pour un restaurant donné
 * 
 * @param name - Nom du restaurant
 * @param userId - ID du propriétaire (scope)
 * @param excludeId - ID du restaurant à exclure (pour les updates)
 * 
 * @returns Slug unique (avec suffixe numérique si nécessaire)
 * 
 * Exemple :
 * - "Le Petit Bistrot" → "le-petit-bistrot"
 * - Si déjà pris → "le-petit-bistrot-2"
 * - Si déjà pris → "le-petit-bistrot-3"
 */
export async function generateUniqueSlug(
  name: string,
  userId: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = transformToSlug(name);
  
  if (!baseSlug) {
    throw new Error('Impossible de générer un slug à partir de ce nom');
  }

  let slug = baseSlug;
  let counter = 1;
  const maxAttempts = 100; // Protection contre boucle infinie

  while (counter <= maxAttempts) {
    // Vérifier si ce slug existe déjà pour cet utilisateur
    const existing = await prisma.restaurant.findFirst({
      where: {
        ownerId: userId,
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });

    // Slug disponible !
    if (!existing) {
      return slug;
    }

    // Slug pris, essayer avec un suffixe
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  // Échec après maxAttempts tentatives
  throw new Error(
    `Impossible de générer un slug unique après ${maxAttempts} tentatives. ` +
    `Veuillez choisir un nom différent.`
  );
}

/**
 * Valide un slug fourni manuellement (si on veut permettre la personnalisation)
 * 
 * @param slug - Slug à valider
 * @param userId - ID du propriétaire
 * @param excludeId - ID du restaurant à exclure (pour les updates)
 * 
 * @returns true si valide et disponible
 * @throws Error si invalide ou déjà pris
 */
export async function validateSlug(
  slug: string,
  userId: string,
  excludeId?: string
): Promise<boolean> {
  // Vérifier le format
  const cleanSlug = transformToSlug(slug);
  if (slug !== cleanSlug) {
    throw new Error(
      'Slug invalide. Utilisez uniquement des lettres minuscules, chiffres et tirets.'
    );
  }

  // Vérifier la longueur
  if (cleanSlug.length < 2) {
    throw new Error('Le slug doit contenir au moins 2 caractères');
  }

  if (cleanSlug.length > 100) {
    throw new Error('Le slug est trop long (max 100 caractères)');
  }

  // Vérifier l'unicité
  const existing = await prisma.restaurant.findFirst({
    where: {
      ownerId: userId,
      slug: cleanSlug,
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error('Ce slug est déjà utilisé par un de vos restaurants');
  }

  return true;
}