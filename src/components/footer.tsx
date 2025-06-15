
"use client";

import Link from 'next/link';
import { Instagram, Github, Palette } from 'lucide-react'; // Using Palette for Pinterest-like, Github as general

interface FooterProps {
  currentYear: number | null;
}

export function Footer({ currentYear }: FooterProps) {
  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'Pinterest (alternative)', icon: Palette, href: 'https://pinterest.com' },
    { name: 'Github', icon: Github, href: 'https://github.com' },
  ];

  const footerLinks = [
    { name: 'Sobre Nosotros', href: '#' },
    { name: 'Contacto', href: '#' },
    { name: 'Política de Privacidad', href: '#' },
  ];

  return (
    <footer className="border-t bg-secondary/50 text-secondary-foreground">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          {/* Copyright */}
          <div className="text-sm">
            &copy; {currentYear ?? new Date().getFullYear()} ArmarioIA. Todos los derechos reservados.
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center md:justify-center space-x-4">
            {socialLinks.map((social) => (
              <Link key={social.name} href={social.href} target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-primary transition-colors">
                <social.icon className="h-6 w-6" />
                <span className="sr-only">{social.name}</span>
              </Link>
            ))}
          </div>

          {/* Footer Links */}
          <div className="flex flex-col md:flex-row justify-center md:justify-end space-y-2 md:space-y-0 md:space-x-4 text-sm">
            {footerLinks.map((link) => (
              <Link key={link.name} href={link.href} className="hover:text-primary hover:underline transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
