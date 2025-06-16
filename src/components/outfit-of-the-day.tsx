
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { getTodaysPlannedOutfit } from '@/app/actions/plannerActions';
import { Shirt, CalendarX } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export async function OutfitOfTheDay() {
  const plannedOutfit = await getTodaysPlannedOutfit();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-headline">
          <Shirt className="mr-2 h-5 w-5 text-primary" />
          Tu Atuendo de Hoy
        </CardTitle>
        {plannedOutfit && (
          <CardDescription>
            {plannedOutfit.outfit.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {plannedOutfit ? (
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex space-x-3 pb-2">
              {plannedOutfit.outfit.clothingItems.length > 0 ? plannedOutfit.outfit.clothingItems.map(item => (
                <div key={item.id} className="flex-shrink-0 relative w-24 h-32 rounded overflow-hidden border bg-secondary/10" title={item.name}>
                  <Image
                    src={item.imageUrl || "https://placehold.co/96x128.png"}
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
              )) : (
                 <p className="text-sm text-muted-foreground pl-1">Este atuendo no tiene prendas asignadas.</p>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div className="text-center py-4 space-y-3">
            <CalendarX className="h-10 w-10 mx-auto text-muted-foreground/70" />
            <p className="text-muted-foreground">Aún no has planeado tu look para hoy.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Ir al Planificador</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
