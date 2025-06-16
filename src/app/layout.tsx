
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const headContent = (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>ArmarioIA - Tu asistente de estilo personal</title>
      <meta name="description" content="Tu asistente de estilo personal" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      {/* Add other global head tags here if needed, e.g., favicons */}
    </head>
  );

  return (
    <html lang="es">
      {headContent}
      <body className="font-body antialiased">
        {children}
        {isMounted && <Toaster />}
      </body>
    </html>
  );
}
