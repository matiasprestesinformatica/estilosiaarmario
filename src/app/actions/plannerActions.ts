
'use server';

import prisma from '@/lib/prisma';
import type { PlannedOutfit, Outfit, ClothingItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { startOfMonth, endOfMonth, parseISO, formatISO } from 'date-fns';
import type { 
  PlannedOutfit as PrismaPlannedOutfit, 
  Outfit as PrismaOutfit,
  ClothingItem as PrismaClothingItem
} from '@prisma/client';

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

// Helper to map Prisma PlannedOutfit to client-side PlannedOutfit
const mapToClientPlannedOutfit = (
  dbPlannedOutfit: PrismaPlannedOutfit & { outfit: PrismaOutfit & { clothingItems: PrismaClothingItem[] } }
): PlannedOutfit => ({
  id: dbPlannedOutfit.id,
  date: formatISO(dbPlannedOutfit.date, { representation: 'date' }), // Store as YYYY-MM-DD
  outfitId: dbPlannedOutfit.outfitId,
  outfit: mapToClientOutfit(dbPlannedOutfit.outfit),
  createdAt: dbPlannedOutfit.createdAt.toISOString(),
  updatedAt: dbPlannedOutfit.updatedAt.toISOString(),
});


export async function planOutfit(date: string, outfitId: string): Promise<PlannedOutfit> {
  try {
    const targetDate = parseISO(date); // Ensures date is parsed correctly
    
    // Upsert: update if exists for that date, otherwise create
    const plannedOutfit = await prisma.plannedOutfit.upsert({
      where: { date: targetDate }, // Prisma will match based on the unique field
      create: {
        date: targetDate,
        outfitId: outfitId,
      },
      update: {
        outfitId: outfitId,
      },
      include: { outfit: { include: { clothingItems: true } } },
    });
    revalidatePath('/');
    return mapToClientPlannedOutfit(plannedOutfit);
  } catch (error) {
    console.error('Error planning outfit (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error planning outfit.';
    throw new Error(`No se pudo planificar el atuendo. Detalles: ${originalErrorMessage}`);
  }
}

export async function getPlannedOutfitsForMonth(year: number, month: number): Promise<PlannedOutfit[]> {
  try {
    const startDate = startOfMonth(new Date(year, month - 1)); // month is 1-indexed for user, 0-indexed for Date
    const endDate = endOfMonth(new Date(year, month - 1));

    const plannedOutfits = await prisma.plannedOutfit.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { outfit: { include: { clothingItems: true } } },
      orderBy: { date: 'asc' },
    });
    return plannedOutfits.map(mapToClientPlannedOutfit);
  } catch (error) {
    console.error('Error fetching planned outfits (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error fetching planned outfits.';
    throw new Error(`No se pudieron cargar los atuendos planificados. Detalles: ${originalErrorMessage}`);
  }
}

export async function deletePlannedOutfit(id: string): Promise<void> {
  try {
    await prisma.plannedOutfit.delete({
      where: { id },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting planned outfit (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error deleting planned outfit.';
    throw new Error(`No se pudo eliminar el atuendo planificado. Detalles: ${originalErrorMessage}`);
  }
}

export async function getPlannedOutfitForDate(date: string): Promise<PlannedOutfit | null> {
  try {
    const targetDate = parseISO(date);
    const plannedOutfit = await prisma.plannedOutfit.findUnique({
      where: { date: targetDate },
      include: { outfit: { include: { clothingItems: true } } },
    });
    return plannedOutfit ? mapToClientPlannedOutfit(plannedOutfit) : null;
  } catch (error)
  {
    console.error('Error fetching planned outfit for date (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error fetching planned outfit for date.';
    throw new Error(`No se pudo cargar el atuendo planificado para la fecha. Detalles: ${originalErrorMessage}`);
  }
}
