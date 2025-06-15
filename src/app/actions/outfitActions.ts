
'use server';

import prisma from '@/lib/prisma';
import type { Outfit, ClothingItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import type { Outfit as PrismaOutfit, ClothingItem as PrismaClothingItem } from '@prisma/client';

// Helper to map Prisma ClothingItem to client-side ClothingItem
const mapToClientClothingItem = (dbItem: PrismaClothingItem): ClothingItem => ({
  ...dbItem,
  category: dbItem.category as ClothingItem['category'],
  description: dbItem.description ?? undefined,
  dateAdded: dbItem.dateAdded.toISOString(),
});

// Helper to map Prisma Outfit to client-side Outfit
const mapToClientOutfit = (dbOutfit: PrismaOutfit & { clothingItems: PrismaClothingItem[] }): Outfit => ({
  id: dbOutfit.id,
  name: dbOutfit.name,
  clothingItems: dbOutfit.clothingItems.map(mapToClientClothingItem),
  createdAt: dbOutfit.createdAt.toISOString(),
  updatedAt: dbOutfit.updatedAt.toISOString(),
});

export async function createOutfit(name: string, clothingItemIds: string[]): Promise<Outfit> {
  try {
    if (!name.trim()) {
      throw new Error('El nombre del atuendo no puede estar vacío.');
    }
    if (clothingItemIds.length === 0) {
      throw new Error('Un atuendo debe tener al menos una prenda.');
    }
    const newOutfit = await prisma.outfit.create({
      data: {
        name,
        clothingItems: {
          connect: clothingItemIds.map(id => ({ id })),
        },
      },
      include: { clothingItems: true },
    });
    revalidatePath('/');
    return mapToClientOutfit(newOutfit);
  } catch (error) {
    console.error('Error creating outfit (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error creating outfit.';
    throw new Error(`No se pudo crear el atuendo. Detalles: ${originalErrorMessage}`);
  }
}

export async function getOutfits(): Promise<Outfit[]> {
  try {
    const outfits = await prisma.outfit.findMany({
      include: { clothingItems: true },
      orderBy: { createdAt: 'desc' },
    });
    return outfits.map(mapToClientOutfit);
  } catch (error) {
    console.error('Error fetching outfits (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error fetching outfits.';
    throw new Error(`No se pudieron cargar los atuendos. Detalles: ${originalErrorMessage}`);
  }
}

export async function deleteOutfit(id: string): Promise<void> {
  try {
    // First, delete any PlannedOutfit entries that reference this outfit
    await prisma.plannedOutfit.deleteMany({
      where: { outfitId: id },
    });
    
    // Then, delete the outfit itself
    await prisma.outfit.delete({
      where: { id },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting outfit (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error deleting outfit.';
    throw new Error(`No se pudo eliminar el atuendo. Detalles: ${originalErrorMessage}`);
  }
}
