
"use client";

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Wand2, Loader2, AlertTriangle, Save } from 'lucide-react';
import type { ClothingItem } from '@/lib/types';
import { generateStyleSuggestion, type GenerateStyleSuggestionOutput, type GenerateStyleSuggestionInput } from '@/ai/flows/generate-style-suggestion';
import { createOutfit } from '@/app/actions/outfitActions';
import { useToast } from '@/hooks/use-toast';

interface StyleSuggestionSectionProps {
  wardrobe: ClothingItem[];
  onOutfitCreated: () => void; 
}

export function StyleSuggestionSection({ wardrobe, onOutfitCreated }: StyleSuggestionSectionProps) {
  const [occasion, setOccasion] = useState('');
  const [suggestion, setSuggestion] = useState<GenerateStyleSuggestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingOutfit, startSavingTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [isSaveOutfitDialogOpen, setIsSaveOutfitDialogOpen] = useState(false);
  const [suggestedOutfitName, setSuggestedOutfitName] = useState('');


  const handleGenerateSuggestion = async () => {
    if (wardrobe.length === 0) {
      toast({
        title: "Armario Vacío",
        description: "Agrega algunos artículos a tu armario primero.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const aiWardrobeInput: GenerateStyleSuggestionInput['wardrobe'] = wardrobe.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description || `A ${item.category} named ${item.name}`,
      }));

      const result = await generateStyleSuggestion({
        wardrobe: aiWardrobeInput,
        occasion: occasion || undefined,
      });
      setSuggestion(result);
      setSuggestedOutfitName(occasion ? `Sugerencia IA: ${occasion}` : `Sugerencia IA ${new Date().toLocaleDateString()}`);
    } catch (err) {
      console.error("Error generating style suggestion:", err);
      const errorMessage = err instanceof Error ? err.message : "No se pudo generar la sugerencia.";
      setError(errorMessage);
      toast({
        title: "Error de IA",
        description: `Hubo un problema al generar la sugerencia de estilo. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSuggestedOutfit = async () => {
    if (!suggestion || !suggestion.styleSuggestion.suggestedItemNames || suggestion.styleSuggestion.suggestedItemNames.length === 0) {
      toast({ title: "Error", description: "No hay artículos sugeridos para guardar.", variant: "destructive" });
      return;
    }
    if (!suggestedOutfitName.trim()) {
      toast({ title: "Error", description: "El nombre del atuendo no puede estar vacío.", variant: "destructive" });
      return;
    }

    startSavingTransition(async () => {
      try {
        const itemNamesToSave = suggestion.styleSuggestion.suggestedItemNames;
        const itemIdsToSave = wardrobe
          .filter(item => itemNamesToSave.includes(item.name))
          .map(item => item.id);

        if (itemIdsToSave.length === 0) {
            toast({ title: "Error", description: "No se pudieron encontrar los artículos sugeridos en tu armario.", variant: "destructive" });
            return;
        }
        
        await createOutfit(suggestedOutfitName, itemIdsToSave);
        toast({ title: "Atuendo Guardado", description: `"${suggestedOutfitName}" ha sido guardado en tu Lookbook.` });
        setIsSaveOutfitDialogOpen(false);
        setSuggestion(null); 
        onOutfitCreated(); 
      } catch (error) {
        console.error('Error saving suggested outfit:', error);
        const errorMessage = error instanceof Error ? error.message : "No se pudo guardar el atuendo.";
        toast({ title: "Error al Guardar", description: errorMessage, variant: "destructive" });
      }
    });
  };

  return (
    <>
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader className="hidden lg:block"> {/* Hide header on mobile sheet view to save space if SheetHeader is used */}
          <CardTitle className="font-headline text-2xl flex items-center">
            <Wand2 className="h-6 w-6 mr-2 text-primary" />
            Sugerencias de Estilo IA
          </CardTitle>
          <CardDescription>
            Obtén ideas de atuendos basadas en tu armario actual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-grow flex flex-col">
          <ScrollArea className="flex-grow">
            <div className="p-1 pr-3 space-y-6"> {/* Added padding for scrollbar */}
              <div>
                <Label htmlFor="occasion" className="text-sm font-medium">Ocasión (opcional)</Label>
                <Input
                  id="occasion"
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="Ej: Casual, Fiesta, Trabajo"
                  className="mt-1"
                  disabled={isLoading || isSavingOutfit}
                />
              </div>
            
              {error && (
                <div className="text-destructive-foreground bg-destructive p-3 rounded-md flex items-center text-sm">
                  <AlertTriangle className="h-5 w-5 mr-2 shrink-0" />
                  {error}
                </div>
              )}

              {suggestion && suggestion.styleSuggestion && (
                <div className="mt-6 p-4 border rounded-md bg-secondary/30 space-y-3">
                  <h3 className="text-lg font-headline text-primary">Atuendo Sugerido:</h3>
                  <p className="text-foreground whitespace-pre-wrap text-sm">{suggestion.styleSuggestion.outfitSuggestion}</p>
                  
                  <h4 className="text-md font-headline text-primary pt-2">Prendas Usadas:</h4>
                  {suggestion.styleSuggestion.suggestedItemNames.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {suggestion.styleSuggestion.suggestedItemNames.map(name => <li key={name}>{name}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">La IA no especificó prendas de tu armario para esta sugerencia.</p>
                  )}
                  
                  <h4 className="text-md font-headline text-primary pt-2">Razonamiento:</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm">{suggestion.styleSuggestion.reasoning}</p>
                  
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="mt-auto pt-4 space-y-2"> {/* Buttons at the bottom */}
            <Button 
              onClick={handleGenerateSuggestion} 
              disabled={isLoading || wardrobe.length === 0 || isSavingOutfit} 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground hover:text-accent-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                "Obtener Sugerencia"
              )}
            </Button>
            {suggestion && suggestion.styleSuggestion && suggestion.styleSuggestion.suggestedItemNames.length > 0 && (
              <Button 
                onClick={() => setIsSaveOutfitDialogOpen(true)} 
                disabled={isSavingOutfit} 
                className="w-full"
                variant="outline"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSavingOutfit ? "Guardando..." : "Guardar Atuendo Sugerido"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isSaveOutfitDialogOpen} onOpenChange={setIsSaveOutfitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Guardar Atuendo Sugerido</DialogTitle>
            <DialogDescription>
              Dale un nombre a este atuendo sugerido por la IA para guardarlo en tu Lookbook.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="suggestedOutfitName">Nombre del Atuendo</Label>
            <Input 
              id="suggestedOutfitName" 
              value={suggestedOutfitName} 
              onChange={(e) => setSuggestedOutfitName(e.target.value)}
              placeholder="Ej: Look casual para el parque" 
              disabled={isSavingOutfit}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSavingOutfit}>Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSaveSuggestedOutfit} disabled={isSavingOutfit || !suggestedOutfitName.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSavingOutfit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Atuendo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
