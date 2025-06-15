"use client";

import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2, CalendarDays } from 'lucide-react';
import type { ClothingItem } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';

interface ClothingItemCardProps {
  item: ClothingItem;
  onEdit: (item: ClothingItem) => void;
  onDelete: (item: ClothingItem) => void;
}

export function ClothingItemCard({ item, onEdit, onDelete }: ClothingItemCardProps) {
  const categoryInfo = CATEGORIES.find(cat => cat.value === item.category);
  const CategoryIcon = categoryInfo?.icon;

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="p-4">
        <div className="relative w-full h-60 rounded-t-md overflow-hidden">
          <Image
            src={item.imageUrl || "https://placehold.co/400x300.png"}
            alt={item.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={`${item.category} clothing`}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-1 truncate" title={item.name}>{item.name}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          {CategoryIcon && <CategoryIcon className="h-4 w-4 mr-1.5" />}
          <Badge variant="secondary">{item.category}</Badge>
        </div>
        {item.description && (
          <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-2" title={item.description}>
            {item.description}
          </CardDescription>
        )}
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
          Agregado: {format(new Date(item.dateAdded), 'PP', { locale: es })}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)} aria-label={`Editar ${item.name}`}>
          <Edit3 className="h-4 w-4 mr-1 md:mr-2" />
          <span className="hidden md:inline">Editar</span>
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(item)} aria-label={`Eliminar ${item.name}`}>
          <Trash2 className="h-4 w-4 mr-1 md:mr-2" />
          <span className="hidden md:inline">Eliminar</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
