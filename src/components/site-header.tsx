import { APP_NAME, APP_ICON } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface SiteHeaderProps {
  onAddItemClick: () => void;
}

export function SiteHeader({ onAddItemClick }: SiteHeaderProps) {
  const AppIcon = APP_ICON || Shirt; // Default icon if not specified
  return (
    <header className="py-6 px-4 md:px-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline tracking-tight">{APP_NAME}</h1>
        </div>
        <Button onClick={onAddItemClick} variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground hover:text-accent-foreground">
          <PlusCircle className="mr-2 h-5 w-5" />
          Agregar Artículo
        </Button>
      </div>
    </header>
  );
}
