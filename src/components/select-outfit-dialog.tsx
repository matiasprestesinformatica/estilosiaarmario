
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Outfit } from '@/lib/types';
import { getOutfits } from '@/app/actions/outfitActions'; // Assuming you have this action
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface SelectOutfitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOutfit: (outfitId: string) => void;
  selectedDate: Date | undefined;
}

export function SelectOutfitDialog({ isOpen, onClose, onSelectOutfit, selectedDate }: SelectOutfitDialogProps) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getOutfits()
        .then(setOutfits)
        .catch(err => console.error("Failed to load outfits for dialog", err))
        .finally(() => setIsLoading(false));
      setSelectedOutfitId(undefined); // Reset selection when dialog opens
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (selectedOutfitId) {
      onSelectOutfit(selectedOutfitId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] md:sm:max-w-[600px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Seleccionar Atuendo para {selectedDate ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </DialogTitle>
          <DialogDescription>
            Elige un atuendo de tu Lookbook para asignarlo a esta fecha.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : outfits.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No tienes atuendos guardados. Crea algunos primero.</p>
        ) : (
          <ScrollArea className="max-h-[60vh] p-1 pr-3">
            <RadioGroup value={selectedOutfitId} onValueChange={setSelectedOutfitId} className="space-y-3">
              {outfits.map((outfit) => (
                <Label 
                  key={outfit.id} 
                  htmlFor={outfit.id} 
                  className="flex items-start space-x-3 p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors has-[:checked]:bg-secondary has-[:checked]:border-primary"
                >
                  <RadioGroupItem value={outfit.id} id={outfit.id} className="mt-1" />
                  <div className="flex flex-col flex-grow">
                    <span className="font-medium text-sm mb-2">{outfit.name}</span>
                    <div className="flex flex-wrap gap-1">
                      {outfit.clothingItems.map(item => (
                        <div key={item.id} className="relative w-10 h-14 rounded-sm overflow-hidden border">
                          <Image 
                            src={item.imageUrl || "https://placehold.co/40x56.png"} 
                            alt={item.name} 
                            layout="fill" 
                            objectFit="cover" 
                            data-ai-hint={`${item.category} clothing`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </ScrollArea>
        )}

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={!selectedOutfitId || isLoading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Asignar Atuendo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

