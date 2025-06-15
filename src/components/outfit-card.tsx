
"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Outfit } from '@/lib/types';
import { Trash2, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OutfitCardProps {
  outfit: Outfit;
  onDelete: (outfitId: string) => void;
  onPlanOutfit?: (outfitId: string) => void; // Optional: for planning directly from card
}

export function OutfitCard({ outfit, onDelete, onPlanOutfit }: OutfitCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="p-4">
        <CardTitle className="text-xl font-headline mb-1 truncate" title={outfit.name}>{outfit.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground flex items-center">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
          Creado: {format(new Date(outfit.createdAt), 'PP', { locale: es })}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        {outfit.clothingItems.length > 0 ? (
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex space-x-3 pb-2">
              {outfit.clothingItems.map(item => (
                <div key={item.id} className="flex-shrink-0 relative w-24 h-32 rounded overflow-hidden border">
                  <Image
                    src={item.imageUrl || "https://placehold.co/100x150.png"}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={`${item.category} clothing`}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                   <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate text-center">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground">Este atuendo no tiene prendas.</p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-end gap-2">
        {onPlanOutfit && (
           <Button variant="outline" size="sm" onClick={() => onPlanOutfit(outfit.id)} aria-label={`Planificar ${outfit.name}`}>
            <CalendarDays className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Planificar</span>
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={() => onDelete(outfit.id)} aria-label={`Eliminar ${outfit.name}`}>
          <Trash2 className="h-4 w-4 mr-1 md:mr-2" />
          <span className="hidden md:inline">Eliminar</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
