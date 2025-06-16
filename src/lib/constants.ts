import type { CategoryOption } from './types';
import { Shirt, GalleryHorizontal, ShoppingBag, Wind, Footprints, Sparkles, Bot } from 'lucide-react';

export const CATEGORIES: CategoryOption[] = [
  { value: 'Prendas Superiores', label: 'Prendas Superiores', icon: Shirt },
  { value: 'Prendas Inferiores', label: 'Prendas Inferiores', icon: GalleryHorizontal },
  { value: 'Vestidos', label: 'Vestidos', icon: ShoppingBag },
  { value: 'Abrigos', label: 'Abrigos', icon: Wind },
  { value: 'Zapatos', label: 'Zapatos', icon: Footprints },
  { value: 'Accesorios', label: 'Accesorios', icon: Sparkles },
];

export const APP_NAME = "ArmarioIA";
export const APP_ICON = Bot;
