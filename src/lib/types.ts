import type { LucideIcon } from 'lucide-react';

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  dateAdded: string; // ISO date string
  description?: string;
}

export type Category = 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Shoes' | 'Accessories';

export interface CategoryOption {
  value: Category;
  label: string;
  icon: LucideIcon;
}
