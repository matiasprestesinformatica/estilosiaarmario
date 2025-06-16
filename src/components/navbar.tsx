
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
  activeTab: string; // Active tab on the main page ('/', e.g. 'wardrobe')
  onTabChange: (tab: string) => void; // To change tabs on the main page
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
    // For main page tabs, change tab and close menu
    if (pathname === '/') {
      onTabChange(tabValue);
    }
    // If navigating away (e.g. to / from /dashboard), Link component handles it.
    // We always close the mobile menu on click.
    setIsMobileMenuOpen(false);
  };
  
  const handleDesktopTabClick = (tabValue: string) => {
     if (pathname === '/') { // Only change tabs if on the main page
        onTabChange(tabValue);
     } else {
        // If on another page like /dashboard, clicking a main page tab link should navigate to '/' and set the tab
        // This requires router.push or Link component. For simplicity with Button, we might need Link asChild.
        // For now, let's assume user clicks Dashboard to go to dashboard, and these tabs are for main page.
        // A full solution would involve router.push('/') then onTabChange or Link components.
     }
  };


  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          onClick={() => pathname !== '/' && setIsMobileMenuOpen(false) }
          legacyBehavior
        >
          <a className="flex items-center gap-2">
            <AppIcon className="h-7 w-7 text-primary" />
            <span className="text-2xl font-headline font-bold tracking-tight">{APP_NAME}</span>
          </a>
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
              {pathname !== '/' ? <Link href="/" legacyBehavior>{link.label}</Link> : link.label}
            </Button>
          ))}
          <Link href="/dashboard" passHref legacyBehavior>
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              size="sm"
              className={`font-medium ${pathname === "/dashboard" ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'}`}
              as="a" // Ensure Button renders as an <a> tag when used with legacyBehavior Link
            >
              <LayoutDashboard className="mr-1 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
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
                  {mainPageNavLinks.map((link) => (
                     <Link 
                        href="/" 
                        passHref 
                        legacyBehavior 
                        key={link.value} 
                        onClick={() => handleMobileLinkClick(link.value)}
                      >
                        <Button
                          variant={(pathname === '/' && activeTab === link.value) ? "secondary" : "ghost"}
                          className={`w-full justify-start text-base ${ (pathname === '/' && activeTab === link.value) ? 'text-primary font-semibold' : 'text-foreground'}`}
                          as="a" // Ensure Button renders as an <a> tag
                        >
                          {link.label}
                        </Button>
                    </Link>
                  ))}
                  <Link href="/dashboard" passHref legacyBehavior onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                         variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                         className={`w-full justify-start text-base ${ pathname === "/dashboard" ? 'text-primary font-semibold' : 'text-foreground'}`}
                         as="a" // Ensure Button renders as an <a> tag
                    >
                        <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                    </Button>
                  </Link>
                  <hr className="my-3"/>
                  <Button variant="ghost" className="w-full justify-start text-base text-foreground">
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
