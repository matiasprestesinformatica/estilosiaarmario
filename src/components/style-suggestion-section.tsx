"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2, AlertTriangle } from 'lucide-react';
import type { ClothingItem } from '@/lib/types';
import { generateStyleSuggestion, type GenerateStyleSuggestionOutput } from '@/ai/flows/generate-style-suggestion';
import { useToast } from '@/hooks/use-toast';

interface StyleSuggestionSectionProps {
  wardrobe: ClothingItem[];
}

export function StyleSuggestionSection({ wardrobe }: StyleSuggestionSectionProps) {
  const [occasion, setOccasion] = useState('');
  const [suggestion, setSuggestion] = useState<GenerateStyleSuggestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      const aiWardrobeInput = wardrobe.map(item => ({
        name: item.name,
        category: item.category,
        imageUrl: item.imageUrl, // Although not used in current prompt, good to include for future
        description: item.description || `A ${item.category} named ${item.name}`,
      }));

      const result = await generateStyleSuggestion({
        wardrobe: aiWardrobeInput,
        occasion: occasion || undefined,
      });
      setSuggestion(result);
    } catch (err) {
      console.error("Error generating style suggestion:", err);
      setError("No se pudo generar la sugerencia. Inténtalo de nuevo.");
      toast({
        title: "Error de IA",
        description: "Hubo un problema al generar la sugerencia de estilo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Wand2 className="h-6 w-6 mr-2 text-primary" />
          Sugerencias de Estilo IA
        </CardTitle>
        <CardDescription>
          Obtén ideas de atuendos basadas en tu armario actual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="occasion" className="text-sm font-medium">Ocasión (opcional)</Label>
          <Input
            id="occasion"
            type="text"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="Ej: Casual, Fiesta, Trabajo"
            className="mt-1"
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleGenerateSuggestion} disabled={isLoading || wardrobe.length === 0} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground hover:text-accent-foreground">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            "Obtener Sugerencia"
          )}
        </Button>

        {error && (
          <div className="text-destructive-foreground bg-destructive p-3 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {suggestion && (
          <div className="mt-6 p-4 border rounded-md bg-secondary/30 space-y-3">
            <h3 className="text-lg font-headline text-primary">Atuendo Sugerido:</h3>
            <p className="text-foreground whitespace-pre-wrap">{suggestion.styleSuggestion.outfitSuggestion}</p>
            <h4 className="text-md font-headline text-primary pt-2">Razonamiento:</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{suggestion.styleSuggestion.reasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
