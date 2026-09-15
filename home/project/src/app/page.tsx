"use client";

import { useState, useEffect, useMemo, useTransition } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { ClothingForm } from '@/components/clothing-form';
import { CategoryFilter } from '@/components/category-filter';
import { StyleSuggestionSection } from '@/components/style-suggestion-section';
import { OutfitCard } from '@/components/outfit-card';
import { OutfitPlanner } from '@/components/outfit-planner';
import { ClothingItemCardSkeleton } from '@/components/clothing-item-card-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import type { ClothingItem, Category, Outfit } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Smile, Loader2, PackagePlus, Trash2, Shirt, Users, CalendarDays, Lightbulb } from 'lucide-react';

import { getWardrobeItems, addClothingItem, updateClothingItem, deleteClothingItem, type AddClothingItemData, type UpdateClothingItemData } from '@/app/actions/wardrobeActions';
import { getOutfits, createOutfit, deleteOutfit as deleteOutfitAction } from '@/app/actions/outfitActions';


export default function HomePage() {
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | undefined>(undefined);
  const [outfitToDelete, setOutfitToDelete] = useState<Outfit | undefined>(undefined);
  
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const { toast } = useToast();
  const [isProcessing, startTransition] = useTransition();
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(true);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIdsForOutfit, setSelectedItemIdsForOutfit] = useState<Set<string>>(new Set());
  const [isCreateOutfitDialogOpen, setIsCreateOutfitDialogOpen] = useState(false);
  const [newOutfitName, setNewOutfitName] = useState("");
  const [isMobileAISheetOpen, setIsMobileAISheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("wardrobe");

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const fetchWardrobeItems = async () => {
    setIsLoadingItems(true);
    try {
      const items = await getWardrobeItems();
      setWardrobeItems(items);
    } catch (error) {
      console.error("Failed to load wardrobe items:", error);
      const errorMessage = error instanceof Error ? error.message : "No se pudieron cargar los artículos del armario.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingItems(false);
    }
  };

  const fetchOutfits = async () => {
    setIsLoadingOutfits(true);
    try {
      const fetchedOutfits = await getOutfits();
      setOutfits(fetchedOutfits);
    } catch (error) {
      console.error("Failed to load outfits:", error);
      const errorMessage = error instanceof Error ? error.message : "No se pudieron cargar los atuendos.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingOutfits(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchWardrobeItems();
      fetchOutfits();
    }
  }, [isClient]);

  const handleAddItemClick = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: ClothingItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItemPrompt = (item: ClothingItem) => {
    setItemToDelete(item);
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      startTransition(async () => {
        try {
          await deleteClothingItem(itemToDelete.id!);
          toast({ title: "Artículo Eliminado", description: `"${itemToDelete.name}" ha sido eliminado.` });
          await fetchWardrobeItems(); 
          setItemToDelete(undefined);
        } catch (error) {
          console.error('Error deleting item:', error);
          toast({ title: "Error al Eliminar", description: (error as Error).message || "No se pudo eliminar el artículo.", variant: "destructive" });
        }
      });
    }
  };

  const handleFormSubmit = (data: Omit<ClothingItem, 'id' | 'dateAdded'>, id?: string) => {
    startTransition(async () => {
      try {
        if (id) {
          await updateClothingItem(id, data as UpdateClothingItemData);
          toast({ title: "Artículo Actualizado", description: `"${data.name}" ha sido actualizado.` });
        } else {
          await addClothingItem(data as AddClothingItemData);
          toast({ title: "Artículo Agregado", description: `"${data.name}" ha sido agregado.` });
        }
        await fetchWardrobeItems(); 
        setIsFormOpen(false);
        setEditingItem(undefined);
      } catch (error) {
        console.error('Error submitting form:', error);
        toast({ title: "Error al Guardar", description: (error as Error).message || "No se pudo guardar el artículo.", variant: "destructive" });
      }
    });
  };
  
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return wardrobeItems;
    return wardrobeItems.filter(item => item.category === selectedCategory);
  }, [wardrobeItems, selectedCategory]);

  const toggleItemSelectionForOutfit = (itemId: string) => {
    setSelectedItemIdsForOutfit(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleCreateOutfit = () => {
    if (selectedItemIdsForOutfit.size === 0 || !newOutfitName.trim()) {
      toast({ title: "Error", description: "Debes seleccionar prendas y darle un nombre al atuendo.", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        await createOutfit(newOutfitName, Array.from(selectedItemIdsForOutfit));
        toast({ title: "Atuendo Creado", description: `"${newOutfitName}" ha sido guardado.` });
        await fetchOutfits(); 
        setIsCreateOutfitDialogOpen(false);
        setNewOutfitName("");
        setSelectedItemIdsForOutfit(new Set());
        setIsSelectionMode(false);
      } catch (error) {
        console.error('Error creating outfit:', error);
        toast({ title: "Error al Crear Atuendo", description: (error as Error).message, variant: "destructive" });
      }
    });
  };

  const handleDeleteOutfitPrompt = (outfit: Outfit) => {
    setOutfitToDelete(outfit);
  };

  const confirmDeleteOutfit = () => {
    if (outfitToDelete) {
      startTransition(async () => {
        try {
          await deleteOutfitAction(outfitToDelete.id!);
          toast({ title: "Atuendo Eliminado", description: `"${outfitToDelete.name}" ha sido eliminado.` });
          await fetchOutfits(); 
          setOutfitToDelete(undefined);
        } catch (error) {
          console.error('Error deleting outfit:', error);
          toast({ title: "Error al Eliminar Atuendo", description: (error as Error).message, variant: "destructive" });
        }
      });
    }
  };
  
  const handleOutfitCreatedFromAI = () => {
    fetchOutfits();
    setIsMobileAISheetOpen(false); 
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar 
        onAddItemClick={handleAddItemClick} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {!isClient ? (
        <main className="flex-grow container mx-auto px-4 md:px-8 py-8 flex justify-center items-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      ) : (
        <main className="flex-grow container mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
                  <TabsList className="grid w-full sm:w-auto grid-cols-3 mb-2 sm:mb-0">
                    <TabsTrigger value="wardrobe"><Shirt className="mr-1 sm:mr-2 h-4 w-4" />Mi Armario</TabsTrigger>
                    <TabsTrigger value="outfits"><Users className="mr-1 sm:mr-2 h-4 w-4" />Mis Atuendos</TabsTrigger>
                    <TabsTrigger value="planner"><CalendarDays className="mr-1 sm:mr-2 h-4 w-4" />Planificador</TabsTrigger>
                  </TabsList>
                  <div className="lg:hidden">
                    <Sheet open={isMobileAISheetOpen} onOpenChange={setIsMobileAISheetOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Lightbulb className="mr-2 h-4 w-4" /> Sugerencias IA
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[80vh] p-4">
                         <SheetHeader className="mb-4">
                           <SheetTitle>Sugerencias de Estilo IA</SheetTitle>
                           <SheetDescription>
                             Obtén ideas de atuendos basadas en tu armario actual.
                           </SheetDescription>
                         </SheetHeader>
                        <StyleSuggestionSection wardrobe={wardrobeItems} onOutfitCreated={handleOutfitCreatedFromAI} />
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                <TabsContent value="wardrobe">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 bg-card rounded-lg shadow">
                    <h2 className="text-2xl font-headline">Mi Armario</h2>
                    <div className="flex flex-col xs:flex-row items-center gap-2 w-full xs:w-auto">
                      <Button 
                        variant={isSelectionMode ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => {
                          setIsSelectionMode(!isSelectionMode);
                          if (isSelectionMode) setSelectedItemIdsForOutfit(new Set());
                        }}
                        className="w-full xs:w-auto"
                      >
                        {isSelectionMode ? "Cancelar Selección" : "Seleccionar para Atuendo"}
                      </Button>
                      <CategoryFilter 
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                      />
                    </div>
                  </div>
                  {isSelectionMode && selectedItemIdsForOutfit.size > 0 && (
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2">
                      <p className="text-sm font-medium text-primary-foreground">
                        {selectedItemIdsForOutfit.size} artículo(s) seleccionados.
                      </p>
                      <Button size="sm" onClick={() => setIsCreateOutfitDialogOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                        <PackagePlus className="mr-2 h-4 w-4"/> Crear Atuendo
                      </Button>
                    </div>
                  )}
                  {isLoadingItems ? (
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                      {Array.from({ length: 12 }).map((_, index) => (
                        <ClothingItemCardSkeleton key={index} />
                      ))}
                    </div>
                  ) : filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                      {filteredItems.map(item => (
                        <ClothingItemCard
                          key={item.id}
                          item={item}
                          onEdit={handleEditItem}
                          onDelete={handleDeleteItemPrompt}
                          isSelected={selectedItemIdsForOutfit.has(item.id)}
                          onSelectToggle={isSelectionMode ? toggleItemSelectionForOutfit : undefined}
                          isSelectionMode={isSelectionMode}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Smile className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-xl text-muted-foreground font-headline">Tu armario está un poco vacío.</p>
                      <p className="text-muted-foreground">
                        {selectedCategory === 'all' ? "¡Agrega algunos artículos para empezar!" : `No hay artículos en la categoría "${selectedCategory}".`}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="outfits">
                  <div className="flex justify-between items-center mb-6 p-4 bg-card rounded-lg shadow">
                     <h2 className="text-2xl font-headline">Mis Atuendos (Lookbook)</h2>
                  </div>
                  {isLoadingOutfits ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.from({ length: 4 }).map((_, index) => (
                         <Card key={index} className="h-60"><CardContent className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>
                      ))}
                    </div>
                  ) : outfits.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {outfits.map(outfit => (
                        <OutfitCard key={outfit.id} outfit={outfit} onDelete={() => handleDeleteOutfitPrompt(outfit)} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PackagePlus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-xl text-muted-foreground font-headline">Aún no has creado atuendos.</p>
                      <p className="text-muted-foreground">Selecciona prendas de tu armario o usa las sugerencias de la IA para empezar.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="planner">
                  <OutfitPlanner />
                </TabsContent>
              </Tabs>
            </div>

            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                 <StyleSuggestionSection wardrobe={wardrobeItems} onOutfitCreated={fetchOutfits} />
              </div>
            </div>
          </div>
        </main>
      )}

      <ClothingForm
        isOpen={isFormOpen}
        onClose={() => {setIsFormOpen(false); setEditingItem(undefined);}}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        isPending={isProcessing}
      />

      <Dialog open={isCreateOutfitDialogOpen} onOpenChange={setIsCreateOutfitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Crear Nuevo Atuendo</DialogTitle>
            <DialogDescription>
              Dale un nombre a tu nuevo atuendo que combina {selectedItemIdsForOutfit.size} prenda(s) seleccionada(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newOutfitName">Nombre del Atuendo</Label>
            <Input 
              id="newOutfitName" 
              value={newOutfitName} 
              onChange={(e) => setNewOutfitName(e.target.value)}
              placeholder="Ej: Look casual de fin de semana" 
              disabled={isProcessing}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOutfitDialogOpen(false)} disabled={isProcessing}>Cancelar</Button>
            <Button onClick={handleCreateOutfit} disabled={isProcessing || !newOutfitName.trim() || selectedItemIdsForOutfit.size === 0} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Atuendo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente "{itemToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(undefined)} disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive hover:bg-destructive/90" disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!outfitToDelete} onOpenChange={() => setOutfitToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">¿Eliminar Atuendo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente el atuendo "{outfitToDelete?.name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOutfitToDelete(undefined)} disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOutfit} className="bg-destructive hover:bg-destructive/90" disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Eliminar Atuendo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {isClient && <Footer currentYear={currentYear} />}
    </div>
  );
}
