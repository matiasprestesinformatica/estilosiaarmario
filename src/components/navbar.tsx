
"use client";

import Link from 'next/link';
import { APP_NAME, APP_ICON } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserCircle2, Menu, LayoutDashboard } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onAddItemClick: () => void;
  activeTab: string; 
  onTabChange: (tab: string) => void; 
}

export function Navbar({ onAddItemClick, activeTab, onTabChange }: NavbarProps) {
  const AppIcon = APP_ICON || UserCircle2;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const mainPageNavLinks = [
    { label: "Mi Armario", value: "wardrobe" },
    { label: "Mis Atuendos", value: "outfits" },
    { label: "Planificador", value: "planner" },
  ];

  const handleMobileLinkClick = (tabValue: string) => {
    if (pathname === '/') {
      onTabChange(tabValue);
    }
    // Navigation to "/" is handled by Link component itself
    setIsMobileMenuOpen(false);
  };
  
  const handleDesktopTabClick = (tabValue: string) => {
     if (pathname === '/') { 
        onTabChange(tabValue);
     }
     // If pathname !== '/', Button's child Link handles navigation
  };


  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => { if (pathname !== '/') setIsMobileMenuOpen(false); } }
        >
          <AppIcon className="h-7 w-7 text-primary" />
          <span className="text-2xl font-headline font-bold tracking-tight">{APP_NAME}</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {mainPageNavLinks.map((link) => (
            <Button
              key={link.value}
              variant={(pathname === '/' && activeTab === link.value) ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleDesktopTabClick(link.value)}
              className={`font-medium ${ (pathname === '/' && activeTab === link.value) ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'}`}
              asChild={pathname !== '/'}
            >
              {pathname !== '/' ? <Link href="/">{link.label}</Link> : <span>{link.label}</span>}
            </Button>
          ))}
          <Button
            variant={pathname === "/dashboard" ? "secondary" : "ghost"}
            size="sm"
            className={`font-medium ${pathname === "/dashboard" ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'}`}
            asChild
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-1 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button 
            onClick={onAddItemClick} 
            variant="outline" 
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground hover:text-accent-foreground"
          >
            <PlusCircle className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Agregar Artículo</span>
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <UserCircle2 className="h-6 w-6" />
            <span className="sr-only">Perfil de Usuario</span>
          </Button>
          
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-6 pt-10">
                <div className="flex flex-col space-y-3">
                  {mainPageNavLinks.map((navLink) => (
                    <Button
                      key={navLink.value}
                      variant={(pathname === '/' && activeTab === navLink.value) ? "secondary" : "ghost"}
                      className={`w-full justify-start text-base ${ (pathname === '/' && activeTab === navLink.value) ? 'text-primary font-semibold' : 'text-foreground'}`}
                      onClick={() => handleMobileLinkClick(navLink.value)}
                      asChild
                    >
                      <Link href="/">
                        {navLink.label}
                      </Link>
                    </Button>
                  ))}
                  <Button
                       variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                       className={`w-full justify-start text-base ${ pathname === "/dashboard" ? 'text-primary font-semibold' : 'text-foreground'}`}
                       onClick={() => setIsMobileMenuOpen(false)}
                       asChild
                  >
                      <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                      </Link>
                  </Button>
                  <hr className="my-3"/>
                  <Button variant="ghost" className="w-full justify-start text-base text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                    <UserCircle2 className="mr-2 h-5 w-5" /> Perfil
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
