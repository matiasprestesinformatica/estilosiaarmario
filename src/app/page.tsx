"use client";

import { useState, useEffect, useMemo, useTransition } from 'react';
import { SiteHeader } from '@/components/site-header';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { ClothingForm } from '@/components/clothing-form';
import { CategoryFilter } from '@/components/category-filter';
import { StyleSuggestionSection } from '@/components/style-suggestion-section';
import type { ClothingItem, Category } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Smile, Loader2 } from 'lucide-react';
import { getWardrobeItems, addClothingItem, updateClothingItem, deleteClothingItem, type AddClothingItemData, type UpdateClothingItemData } from '@/app/actions/wardrobeActions';

export default function HomePage() {
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoadingItems(true);
      try {
        const items = await getWardrobeItems();
        setWardrobeItems(items);
      } catch (error) {
        console.error("Failed to load wardrobe items:", error);
        toast({ title: "Error", description: "No se pudieron cargar los artículos del armario.", variant: "destructive" });
      } finally {
        setIsLoadingItems(false);
      }
    };
    loadItems();
  }, [toast]);

  const handleAddItemClick = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: ClothingItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = (item: ClothingItem) => {
    setItemToDelete(item);
  };

  const fetchItemsAndUpdateState = async () => {
    try {
      const items = await getWardrobeItems();
      setWardrobeItems(items);
    } catch (error) {
       console.error("Failed to refresh wardrobe items:", error);
       toast({ title: "Error", description: "No se pudieron actualizar los artículos del armario.", variant: "destructive" });
    }
  }

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      startTransition(async () => {
        try {
          await deleteClothingItem(itemToDelete.id!);
          toast({ title: "Artículo Eliminado", description: `"${itemToDelete.name}" ha sido eliminado de tu armario.` });
          await fetchItemsAndUpdateState();
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
        if (id) { // Editing existing item
          await updateClothingItem(id, data as UpdateClothingItemData);
          toast({ title: "Artículo Actualizado", description: `"${data.name}" ha sido actualizado.` });
        } else { // Adding new item
          await addClothingItem(data as AddClothingItemData);
          toast({ title: "Artículo Agregado", description: `"${data.name}" ha sido agregado a tu armario.` });
        }
        await fetchItemsAndUpdateState();
        setIsFormOpen(false);
        setEditingItem(undefined);
      } catch (error) {
        console.error('Error submitting form:', error);
        toast({ title: "Error al Guardar", description: (error as Error).message || "No se pudo guardar el artículo.", variant: "destructive" });
      }
    });
  };
  
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return wardrobeItems;
    }
    return wardrobeItems.filter(item => item.category === selectedCategory);
  }, [wardrobeItems, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader onAddItemClick={handleAddItemClick} />
      
      <main className="flex-grow container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wardrobe Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 bg-card rounded-lg shadow">
              <h2 className="text-2xl font-headline">Mi Armario</h2>
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            {isPending || isLoadingItems ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <ClothingItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Smile className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground font-headline">Tu armario está un poco vacío.</p>
                <p className="text-muted-foreground">
                  {selectedCategory === 'all' 
                    ? "¡Agrega algunos artículos para empezar!" 
                    : `No hay artículos en la categoría "${selectedCategory}".`}
                </p>
              </div>
            )}
          </div>

          {/* AI Suggestions Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6"> {/* Adjust top value based on header height */}
               <StyleSuggestionSection wardrobe={wardrobeItems} />
            </div>
          </div>
        </div>
      </main>

      <ClothingForm
        isOpen={isFormOpen}
        onClose={() => {setIsFormOpen(false); setEditingItem(undefined);}}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        isPending={isPending}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el artículo "{itemToDelete?.name}" de tu armario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(undefined)} disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteItem} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <footer className="text-center py-6 border-t text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ArmarioIA. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
