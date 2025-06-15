"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import type { ClothingItem, Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { useEffect } from "react";

const clothingItemSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }).max(50, { message: "El nombre no puede exceder los 50 caracteres." }),
  category: z.enum(CATEGORIES.map(c => c.value) as [Category, ...Category[]], {
    required_error: "Debes seleccionar una categoría.",
  }),
  imageUrl: z.string().url({ message: "Por favor, introduce una URL de imagen válida." }),
  description: z.string().max(200, { message: "La descripción no puede exceder los 200 caracteres." }).optional(),
});

type ClothingFormValues = z.infer<typeof clothingItemSchema>;

interface ClothingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClothingFormValues, id?: string) => void;
  initialData?: ClothingItem;
}

export function ClothingForm({ isOpen, onClose, onSubmit, initialData }: ClothingFormProps) {
  const form = useForm<ClothingFormValues>({
    resolver: zodResolver(clothingItemSchema),
    defaultValues: initialData ? {
        name: initialData.name,
        category: initialData.category,
        imageUrl: initialData.imageUrl,
        description: initialData.description || "",
      } : {
        name: "",
        category: undefined,
        imageUrl: "",
        description: "",
      },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        category: initialData.category,
        imageUrl: initialData.imageUrl,
        description: initialData.description || "",
      });
    } else {
      form.reset({
        name: "",
        category: undefined,
        imageUrl: "",
        description: "",
      });
    }
  }, [initialData, form, isOpen]);


  const handleSubmit = (values: ClothingFormValues) => {
    onSubmit(values, initialData?.id);
    form.reset(); // Reset form after submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-[600px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {initialData ? "Editar Artículo" : "Agregar Nuevo Artículo"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Artículo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Camisa de Lino Blanca" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center">
                            <cat.icon className="h-4 w-4 mr-2" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Asegúrate que la URL sea accesible públicamente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Ideal para verano, tejido ligero..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Detalles adicionales para la IA (color, material, estilo).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground hover:text-accent-foreground">
                {initialData ? "Guardar Cambios" : "Agregar Artículo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
