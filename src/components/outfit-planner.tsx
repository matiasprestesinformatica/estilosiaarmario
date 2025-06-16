
"use client";

import { useState, useEffect, useTransition } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { es } from 'date-fns/locale';
import { format, parseISO, startOfDay, isSameDay } from 'date-fns';
import type { PlannedOutfit, Outfit as OutfitType } from '@/lib/types';
import { getPlannedOutfitsForMonth, planOutfit, deletePlannedOutfit } from '@/app/actions/plannerActions';
import { useToast } from "@/hooks/use-toast";
import { SelectOutfitDialog } from './select-outfit-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, XCircle } from 'lucide-react';
import Image from 'next/image';

export function OutfitPlanner() {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null); // Initialize to null
  const [plannedOutfits, setPlannedOutfits] = useState<PlannedOutfit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentMonth(new Date()); // Set on client side after mount
  }, []);

  const fetchPlannedOutfits = (date: Date) => {
    setIsLoading(true);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // month is 1-indexed for action
    getPlannedOutfitsForMonth(year, month)
      .then(setPlannedOutfits)
      .catch(err => {
        console.error("Failed to load planned outfits:", err);
        toast({ title: "Error", description: "No se pudieron cargar los atuendos planificados.", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (currentMonth) { // Fetch only if currentMonth is set
      fetchPlannedOutfits(currentMonth);
    }
  }, [currentMonth, toast]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(startOfDay(day)); // Ensure we use the start of the day for consistency
    setIsDialogOpen(true);
  };

  const handleSelectOutfit = (outfitId: string) => {
    if (selectedDate) {
      startTransition(async () => {
        try {
          const dateString = format(selectedDate, 'yyyy-MM-dd');
          await planOutfit(dateString, outfitId);
          toast({ title: "Atuendo Planificado", description: "El atuendo ha sido asignado a la fecha." });
          if (currentMonth) fetchPlannedOutfits(currentMonth); // Refresh
        } catch (error) {
          console.error('Error planning outfit:', error);
          toast({ title: "Error", description: (error as Error).message || "No se pudo planificar el atuendo.", variant: "destructive" });
        }
      });
    }
    setIsDialogOpen(false);
  };
  
  const handleDeletePlannedOutfit = (plannedOutfitId: string) => {
    startTransition(async () => {
        try {
            await deletePlannedOutfit(plannedOutfitId);
            toast({ title: "Planificación Eliminada", description: "El atuendo ha sido desasignado de esta fecha." });
            if (currentMonth) fetchPlannedOutfits(currentMonth); // Refresh
        } catch (error) {
            console.error('Error deleting planned outfit:', error);
            toast({ title: "Error", description: (error as Error).message || "No se pudo eliminar la planificación.", variant: "destructive" });
        }
    });
  };

  const plannedDatesModifiers = plannedOutfits.reduce((acc, po) => {
    acc[format(parseISO(po.date), 'yyyy-MM-dd')] = { planned: true, outfitName: po.outfit.name };
    return acc;
  }, {} as Record<string, { planned: boolean, outfitName?: string }>);
  
  const modifiers = {
    planned: (date: Date) => !!plannedDatesModifiers[format(date, 'yyyy-MM-dd')],
  };
  const modifiersClassNames = {
    planned: 'bg-accent/30 text-accent-foreground rounded-full',
  };

  const selectedDayPlan = selectedDate ? plannedOutfits.find(po => isSameDay(parseISO(po.date), selectedDate)) : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Planificador de Atuendos</CardTitle>
            <CardDescription>Asigna tus atuendos guardados a fechas específicas en el calendario.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {(isLoading && !isPending && !currentMonth) && <Loader2 className="h-8 w-8 animate-spin text-primary my-10" />}
            {currentMonth && (!isLoading || isPending) && (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => day && handleDayClick(day)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={es}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className="rounded-md border shadow p-0"
                disabled={isPending}
                footer={
                  selectedDate ? (
                    <p className="text-sm text-center p-2">
                      Seleccionado: {format(selectedDate, 'PPP', { locale: es })}
                      {plannedDatesModifiers[format(selectedDate, 'yyyy-MM-dd')]?.outfitName && 
                       ` - Atuendo: ${plannedDatesModifiers[format(selectedDate, 'yyyy-MM-dd')]?.outfitName}`
                      }
                    </p>
                  ) : (
                    <p className="text-sm text-center p-2 text-muted-foreground">Selecciona un día para planificar un atuendo.</p>
                  )
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              {selectedDate ? `Plan para ${format(selectedDate, 'PPP', { locale: es })}` : "Detalle del Día"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPending && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
            {!isPending && selectedDayPlan && (
              <div className="space-y-3">
                <h3 className="font-semibold">{selectedDayPlan.outfit.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDayPlan.outfit.clothingItems.slice(0,4).map(item => (
                    <div key={item.id} className="relative w-16 h-20 rounded border overflow-hidden">
                      <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
                    </div>
                  ))}
                </div>
                <Button onClick={() => handleDeletePlannedOutfit(selectedDayPlan.id)} variant="destructive" size="sm" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4"/> Quitar Atuendo del Día
                </Button>
              </div>
            )}
            {!isPending && selectedDate && !selectedDayPlan && (
              <div className="text-center text-muted-foreground space-y-2">
                <XCircle className="h-10 w-10 mx-auto text-muted-foreground/50"/>
                <p>No hay atuendo planificado para este día.</p>
                <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="w-full">
                    Asignar Atuendo
                </Button>
              </div>
            )}
            {!isPending && !selectedDate && (
               <p className="text-sm text-muted-foreground text-center py-4">Selecciona un día en el calendario.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <SelectOutfitDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectOutfit={handleSelectOutfit}
        selectedDate={selectedDate}
      />
    </div>
  );
}
