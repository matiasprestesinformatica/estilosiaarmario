
"use client";

import { useState, useEffect, useMemo, useTransition } from 'react';
import { SiteHeader } from '@/components/site-header';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { ClothingForm } from '@/components/clothing-form';
import { CategoryFilter } from '@/components/category-filter';
import { StyleSuggestionSection } from '@/components/style-suggestion-section';
import { OutfitCard } from '@/components/outfit-card';
import { OutfitPlanner } from '@/components/outfit-planner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import type { ClothingItem, Category, Outfit } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Smile, Loader2, PackagePlus, Trash2, Shirt, Users, CalendarDays } from 'lucide-react';

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
  const [isProcessing, startTransition] = useTransition(); // General purpose transition
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(true);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  // State for creating outfits
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIdsForOutfit, setSelectedItemIdsForOutfit] = useState<Set<string>>(new Set());
  const [isCreateOutfitDialogOpen, setIsCreateOutfitDialogOpen] = useState(false);
  const [newOutfitName, setNewOutfitName] = useState("");

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
    fetchWardrobeItems();
    fetchOutfits();
    setCurrentYear(new Date().getFullYear());
  }, [toast]);

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
          await fetchWardrobeItems(); // Refresh items
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
        await fetchWardrobeItems(); // Refresh items
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

  // Outfit creation logic
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
        await fetchOutfits(); // Refresh outfits
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
          await fetchOutfits(); // Refresh outfits
          setOutfitToDelete(undefined);
        } catch (error) {
          console.error('Error deleting outfit:', error);
          toast({ title: "Error al Eliminar Atuendo", description: (error as Error).message, variant: "destructive" });
        }
      });
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader onAddItemClick={handleAddItemClick} />
      
      <main className="flex-grow container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="wardrobe" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="wardrobe"><Shirt className="mr-2 h-4 w-4" />Mi Armario</TabsTrigger>
                <TabsTrigger value="outfits"><Users className="mr-2 h-4 w-4" />Mis Atuendos</TabsTrigger>
                <TabsTrigger value="planner"><CalendarDays className="mr-2 h-4 w-4" />Planificador</TabsTrigger>
              </TabsList>

              {/* Tab: Mi Armario */}
              <TabsContent value="wardrobe">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 bg-card rounded-lg shadow">
                  <h2 className="text-2xl font-headline">Mi Armario</h2>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={isSelectionMode ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => {
                        setIsSelectionMode(!isSelectionMode);
                        if (isSelectionMode) setSelectedItemIdsForOutfit(new Set()); // Clear selection when exiting mode
                      }}
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
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg flex justify-between items-center">
                    <p className="text-sm font-medium text-primary-foreground">
                      {selectedItemIdsForOutfit.size} artículo(s) seleccionados.
                    </p>
                    <Button size="sm" onClick={() => setIsCreateOutfitDialogOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <PackagePlus className="mr-2 h-4 w-4"/> Crear Atuendo
                    </Button>
                  </div>
                )}
                {isProcessing || isLoadingItems ? (
                  <div className="flex justify-center items-center py-12"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
                ) : filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

              {/* Tab: Mis Atuendos */}
              <TabsContent value="outfits">
                <div className="flex justify-between items-center mb-6 p-4 bg-card rounded-lg shadow">
                   <h2 className="text-2xl font-headline">Mis Atuendos (Lookbook)</h2>
                </div>
                {isLoadingOutfits ? (
                  <div className="flex justify-center items-center py-12"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
                ) : outfits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {outfits.map(outfit => (
                      <OutfitCard key={outfit.id} outfit={outfit} onDelete={handleDeleteOutfitPrompt} />
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

              {/* Tab: Planificador */}
              <TabsContent value="planner">
                <OutfitPlanner />
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Suggestions Section (Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
               <StyleSuggestionSection wardrobe={wardrobeItems} onOutfitCreated={fetchOutfits} />
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
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
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Eliminar
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
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Eliminar Atuendo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <footer className="text-center py-6 border-t text-sm text-muted-foreground">
        <p>&copy; {currentYear ?? new Date().getFullYear()} ArmarioIA. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
