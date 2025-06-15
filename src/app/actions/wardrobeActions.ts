
'use server';

import prisma from '@/lib/prisma';
import type { ClothingItem, Category } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import type { ClothingItem as PrismaClothingItem } from '@prisma/client';

// Helper function to map Prisma item to our client-side ClothingItem type
const mapToClientClothingItem = (dbItem: PrismaClothingItem): ClothingItem => {
  return {
    ...dbItem,
    category: dbItem.category as Category, // dbItem.category is string, cast to our Category type
    description: dbItem.description ?? undefined,
    dateAdded: dbItem.dateAdded.toISOString(),
  };
};

export async function getWardrobeItems(): Promise<ClothingItem[]> {
  try {
    const items = await prisma.clothingItem.findMany({
      orderBy: {
        dateAdded: 'desc',
      },
    });
    return items.map(mapToClientClothingItem);
  } catch (error) {
    console.error('Error fetching wardrobe items (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error during fetch.';
    throw new Error(`Failed to fetch wardrobe items. Details: ${originalErrorMessage}`);
  }
}

export interface AddClothingItemData {
  name: string;
  category: Category;
  imageUrl: string;
  description?: string;
}

export async function addClothingItem(data: AddClothingItemData): Promise<ClothingItem> {
  try {
    const newItem = await prisma.clothingItem.create({
      data: {
        name: data.name,
        category: data.category, // Prisma schema expects a String, our Category type is compatible
        imageUrl: data.imageUrl,
        description: data.description,
      },
    });
    revalidatePath('/');
    return mapToClientClothingItem(newItem);
  } catch (error) {
    console.error('Error adding clothing item (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error adding item.';
    throw new Error(`Failed to add clothing item. Details: ${originalErrorMessage}`);
  }
}

export interface UpdateClothingItemData {
  name?: string;
  category?: Category;
  imageUrl?: string;
  description?: string;
}

export async function updateClothingItem(id: string, data: UpdateClothingItemData): Promise<ClothingItem> {
  try {
    const updatedItem = await prisma.clothingItem.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category, // Prisma schema expects a String, our Category type is compatible
        imageUrl: data.imageUrl,
        description: data.description,
      },
    });
    revalidatePath('/');
    return mapToClientClothingItem(updatedItem);
  } catch (error) {
    console.error('Error updating clothing item (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error updating item.';
    throw new Error(`Failed to update clothing item. Details: ${originalErrorMessage}`);
  }
}

export async function deleteClothingItem(id: string): Promise<void> {
  try {
    await prisma.clothingItem.delete({
      where: { id },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting clothing item (server log):', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error deleting item.';
    throw new Error(`Failed to delete clothing item. Details: ${originalErrorMessage}`);
  }
}
