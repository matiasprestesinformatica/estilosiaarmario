
'use server';
/**
 * @fileOverview Server actions for the dashboard.
 *
 * - getWardrobeStatistics - Fetches statistics about wardrobe items, outfits, and planned days.
 * - WardrobeStats - The return type for getWardrobeStatistics.
 */

import prisma from '@/lib/prisma';

export interface WardrobeStats {
  totalClothingItems: number;
  totalOutfits: number;
  totalPlannedDays: number;
}

export async function getWardrobeStatistics(): Promise<WardrobeStats> {
  try {
    const totalClothingItems = await prisma.clothingItem.count();
    const totalOutfits = await prisma.outfit.count();
    // Counts distinct days that have at least one planned outfit.
    // This might be more intensive if there are many planned outfits.
    // A simpler alternative is `prisma.plannedOutfit.count()` for total planned entries.
    // For "días planificados", counting distinct dates seems more accurate.
    const plannedDaysCount = await prisma.plannedOutfit.count({
      // This is not a direct way to count distinct days in Prisma count.
      // We need to fetch distinct dates and count them.
    });

    // Correct way to count distinct planned days
    const distinctPlannedDays = await prisma.plannedOutfit.findMany({
      select: {
        date: true,
      },
      distinct: ['date'],
    });
    const totalPlannedDays = distinctPlannedDays.length;


    return {
      totalClothingItems,
      totalOutfits,
      totalPlannedDays,
    };
  } catch (error) {
    console.error('Error fetching wardrobe statistics:', error);
    throw new Error('No se pudieron obtener las estadísticas del armario.');
  }
}

    