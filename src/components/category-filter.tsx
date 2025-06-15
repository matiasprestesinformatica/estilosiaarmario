"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import type { Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { Filter } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center space-x-2">
      <Filter className="h-5 w-5 text-muted-foreground" />
      <Select onValueChange={(value: Category | 'all') => onCategoryChange(value)} value={selectedCategory}>
        <SelectTrigger className="w-[200px] md:w-[280px]">
          <SelectValue placeholder="Filtrar por categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="font-headline">Categorías</SelectLabel>
            <SelectItem value="all">
              <div className="flex items-center">Todas las categorías</div>
            </SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center">
                  <cat.icon className="h-4 w-4 mr-2" />
                  {cat.label}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
