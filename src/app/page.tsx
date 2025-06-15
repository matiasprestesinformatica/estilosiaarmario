"use client";

import { useState, useEffect, useMemo } from 'react';
import { SiteHeader } from '@/components/site-header';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { ClothingForm } from '@/components/clothing-form';
import { CategoryFilter } from '@/components/category-filter';
import { StyleSuggestionSection } from '@/components/style-suggestion-section';
import type { ClothingItem, Category } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Smile } from 'lucide-react';

// Sample initial data
const initialItems: ClothingItem[] = [
  { id: '1', name: 'Camisa de Algodón Azul', category: 'Tops', imageUrl: 'https://placehold.co/400x300.png', dateAdded: new Date(2023, 0, 15).toISOString(), description: 'Camisa azul de algodón, perfecta para uso casual.' },
  { id: '2', name: 'Vaqueros Slim Fit', category: 'Bottoms', imageUrl: 'https://placehold.co/400x300.png', dateAdded: new Date(2023, 1, 20).toISOString(), description: 'Vaqueros de corte slim, color azul oscuro.' },
  { id: '3', name: 'Zapatillas Blancas Urbanas', category: 'Shoes', imageUrl: 'https://placehold.co/400x300.png', dateAdded: new Date(2023, 2, 5).toISOString(), description: 'Zapatillas de cuero sintético blancas, estilo urbano.' },
];


export default function HomePage() {
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const { toast } = useToast();

  // Load items from local storage or use initialItems
  useEffect(() => {
    const storedItems = localStorage.getItem('armarioIAItems');
    if (storedItems) {
      setWardrobeItems(JSON.parse(storedItems));
    } else {
      setWardrobeItems(initialItems);
    }
  }, []);

  // Save items to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('armarioIAItems', JSON.stringify(wardrobeItems));
  }, [wardrobeItems]);


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

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      setWardrobeItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
      toast({ title: "Artículo Eliminado", description: `"${itemToDelete.name}" ha sido eliminado de tu armario.` });
      setItemToDelete(undefined);
    }
  };

  const handleFormSubmit = (data: Omit<ClothingItem, 'id' | 'dateAdded'>, id?: string) => {
    if (id) { // Editing existing item
      setWardrobeItems(prevItems =>
        prevItems.map(item => (item.id === id ? { ...item, ...data } : item))
      );
      toast({ title: "Artículo Actualizado", description: `"${data.name}" ha sido actualizado.` });
    } else { // Adding new item
      const newItem: ClothingItem = {
        ...data,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString(),
      };
      setWardrobeItems(prevItems => [newItem, ...prevItems]);
      toast({ title: "Artículo Agregado", description: `"${newItem.name}" ha sido agregado a tu armario.` });
    }
    setIsFormOpen(false);
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

            {filteredItems.length > 0 ? (
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
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
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
            <AlertDialogCancel onClick={() => setItemToDelete(undefined)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive hover:bg-destructive/90">
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
