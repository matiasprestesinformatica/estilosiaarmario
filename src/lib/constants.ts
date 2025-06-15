import type { CategoryOption } from './types';
import { Shirt, GalleryHorizontal, ShoppingBag, Wind, Footprints, Sparkles, Bot } from 'lucide-react';

export const CATEGORIES: CategoryOption[] = [
  { value: 'Tops', label: 'Prendas Superiores', icon: Shirt },
  { value: 'Bottoms', label: 'Prendas Inferiores', icon: GalleryHorizontal },
  { value: 'Dresses', label: 'Vestidos', icon: ShoppingBag },
  { value: 'Outerwear', label: 'Abrigos', icon: Wind },
  { value: 'Shoes', label: 'Zapatos', icon: Footprints },
  { value: 'Accessories', label: 'Accesorios', icon: Sparkles },
];

export const APP_NAME = "ArmarioIA";
export const APP_ICON = Bot;
