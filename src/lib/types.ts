
import type { LucideIcon } from 'lucide-react';

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  dateAdded: string; // ISO date string
  description?: string;
}

export type Category = 'Prendas Superiores' | 'Prendas Inferiores' | 'Vestidos' | 'Abrigos' | 'Zapatos' | 'Accesorios';

export interface CategoryOption {
  value: Category;
  label: string;
  icon: LucideIcon;
}

export interface Outfit {
  id: string;
  name: string;
  clothingItems: ClothingItem[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface PlannedOutfit {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  outfitId: string;
  outfit: Outfit; // Outfit is included when fetched
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
