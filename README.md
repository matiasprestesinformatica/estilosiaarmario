
# ArmarioIA: Tu Asistente de Estilo Personal con IA

## 1. Descripción General del Proyecto

**¿Cuál es el propósito del proyecto?**
ArmarioIA es una aplicación web diseñada para funcionar como un asistente de estilo personal y un gestor de armario digital. Permite a los usuarios catalogar sus prendas de vestir, crear y planificar atuendos, y recibir sugerencias de estilo personalizadas generadas por inteligencia artificial.

**¿Qué problema resuelve o qué valor aporta?**
El proyecto busca resolver la dificultad de organizar un armario extenso, la indecisión al elegir qué ponerse y la falta de inspiración para combinar prendas. Aporta valor al:
*   Facilitar la visualización y gestión del inventario de ropa.
*   Ayudar en la planificación de atuendos para diferentes ocasiones.
*   Ofrecer sugerencias de estilo creativas y personalizadas basadas en las prendas existentes del usuario, fomentando un uso más eficiente y sostenible de su guardarropa.
*   Reducir el tiempo dedicado a decidir qué vestir.

**¿Quiénes son los usuarios objetivo?**
Personas interesadas en la moda, la organización personal, la optimización de su vestimenta, y aquellas que buscan inspiración para sus atuendos diarios o para ocasiones especiales. También es útil para quienes desean tener un mayor control y conocimiento sobre las prendas que poseen.

**¿Es un proyecto nuevo o una migración/actualización de uno existente?**
Es un proyecto nuevo, desarrollado desde cero.

## 2. Detalles Técnicos

**Versión de Next.js que estás utilizando.**
Next.js 15.3.3.

**¿Estás usando el App Router o el Pages Router?**
Se está utilizando el **App Router** para toda la estructura de la aplicación, aprovechando sus capacidades para layouts anidados, Server Components y Server Actions.

**¿Estás utilizando TypeScript o JavaScript?**
El proyecto está desarrollado íntegramente en **TypeScript** para mejorar la calidad del código, la mantenibilidad y la detección temprana de errores.

**¿Qué método de renderizado estás empleando principalmente?**
Se emplea una mezcla de métodos:
*   **Client-Side Rendering (CSR)**: La interfaz principal (`src/app/page.tsx`) es un Componente Cliente (`"use client"`) para permitir una alta interactividad con el usuario (filtros, formularios, selección de ítems). Los datos iniciales se cargan mediante hooks `useEffect` en el cliente.
*   **Server Actions**: Se utilizan para todas las mutaciones de datos (crear, actualizar, eliminar artículos, atuendos, etc.), ejecutándose en el servidor.
*   **Server Components**: Por defecto, Next.js con App Router favorece Server Components. Componentes estructurales como `RootLayout` son Server Components. La lógica de Genkit para IA (`src/ai/flows/`) también se ejecuta en el servidor.

**¿Qué librerías o frameworks de UI estás utilizando?**
*   **ShadCN UI**: Para la mayoría de los componentes de interfaz de usuario (botones, tarjetas, diálogos, etc.).
*   **Tailwind CSS**: Para el estilizado general y la personalización de componentes.
*   **Lucide Icons**: Para la iconografía en toda la aplicación.

**¿Estás usando alguna librería de manejo de estado?**
Principalmente se utilizan los hooks integrados de React:
*   `useState` para el estado local de los componentes.
*   `useTransition` para gestionar el estado pendiente de las Server Actions y otras operaciones asíncronas.
*   `useReducer` (implícito a través de `useToast` de ShadCN) para el manejo de notificaciones.
No se utiliza una librería de manejo de estado global dedicada como Zustand o Redux.

**¿Cómo manejas la gestión de datos/fetching?**
*   **Server Actions**: Para todas las operaciones de escritura (CUD) y algunas lecturas que se desencadenan por acciones del usuario.
*   **Fetch API (implícito en `useEffect` y Server Actions)**: Para la carga inicial de datos en el cliente (ej. `getWardrobeItems()`, `getOutfits()`) dentro de hooks `useEffect`. Prisma Client es usado dentro de las Server Actions para interactuar con la base de datos.
*   **Genkit**: Para interactuar con modelos de IA (Google AI) para generar sugerencias de estilo.

**¿Estás utilizando alguna base de datos?**
Sí, **PostgreSQL**.

**¿Qué ORM/ODM estás usando (si aplica)?**
**Prisma ORM** (versión 6.9.0) para la interacción con la base de datos PostgreSQL. Se utiliza con Prisma Accelerate para optimizar las consultas en producción/despliegue.

**¿Dónde está alojado el proyecto?**
Actualmente, el desarrollo se realiza en **Firebase Studio**. El archivo `apphosting.yaml` sugiere que está preparado para un posible despliegue en **Firebase App Hosting**. Las variables de entorno indican el uso de servicios de base de datos remotos (Prisma Data Platform para Accelerate).

**¿Cómo manejas la autenticación?**
La autenticación de usuarios no está implementada explícitamente en la versión actual. Se ha incluido un ícono de perfil de usuario en la barra de navegación como marcador de posición para una futura implementación.

**¿Hay alguna API externa que estés consumiendo?**
*   **Google AI (via Genkit)**: Para la generación de sugerencias de estilo.
*   **Supabase Storage**: Configurado para el almacenamiento y la recuperación de imágenes de las prendas de vestir.

## 3. Estado Actual y Desafíos

**¿En qué fase de desarrollo se encuentra el proyecto?**
En **desarrollo activo**. Las características principales (gestión de armario, creación de atuendos, planificación y sugerencias de IA básicas) están implementadas. Se están refinando funcionalidades y corrigiendo errores.

**¿Cuál es el objetivo específico de tu pregunta/tema en el chat?**
Esta sección del README tiene como objetivo documentar de manera exhaustiva el estado y la arquitectura del proyecto para facilitar su comprensión y desarrollo continuo.

**¿Cuáles son los principales desafíos o problemas que se pueden enfrentar?**
*   Mantener la coherencia y el rendimiento de la interfaz a medida que crece la cantidad de datos (artículos, atuendos).
*   Optimizar las interacciones con la IA para que sean rápidas y relevantes.
*   Asegurar una experiencia de usuario fluida y responsiva en diferentes dispositivos.
*   Implementar de forma segura y robusta la autenticación y la gestión de datos de usuario.

## 4. Arquitectura y Estructura

**¿Puedes describir brevemente la estructura de directorios o cómo tienes organizado el código?**
La estructura sigue las convenciones de Next.js con el App Router:
*   `src/app/`: Contiene las rutas principales de la aplicación (`page.tsx` para la página de inicio, `layout.tsx` para la estructura general).
*   `src/app/actions/`: Define las Server Actions para interactuar con el backend (Prisma, IA).
*   `src/components/`: Alberga los componentes React reutilizables.
    *   `src/components/ui/`: Contiene los componentes base de ShadCN UI.
*   `src/lib/`: Incluye utilidades (`utils.ts`), constantes (`constants.ts`), definiciones de tipos TypeScript (`types.ts`), y la configuración del cliente Prisma (`prisma.ts`).
*   `src/ai/`: Contiene la lógica relacionada con Genkit para las funcionalidades de IA.
    *   `src/ai/flows/`: Define los flujos de Genkit.
*   `prisma/`: Contiene el esquema de la base de datos (`schema.prisma`) y las migraciones.
*   `public/`: Para activos estáticos (actualmente no se usa para imágenes principales de la app).

**¿Hay algún patrón de diseño específico que estés siguiendo?**
*   **Componentes Funcionales y Hooks**: Estándar en React moderno.
*   **Composición de Componentes**: Para construir la UI de manera modular.
*   **Server Actions**: Para el manejo de mutaciones de datos y lógica de backend directamente desde componentes cliente/servidor.
*   **Separación de Lógica de UI y Lógica de Negocio**: La lógica de datos y IA se encuentra en `actions` y `ai/flows` respectivamente, separada de los componentes de presentación.

**¿Cómo manejas las rutas y la navegación?**
*   Se utiliza el sistema de enrutamiento basado en archivos del **App Router** de Next.js.
*   La navegación principal dentro de la página de inicio se gestiona mediante el componente `Tabs` de ShadCN UI, controlado por el estado en `page.tsx` y la `Navbar`.

## 5. Consideraciones Adicionales

**¿Hay algún requisito de rendimiento o SEO particular?**
*   **Rendimiento**: Se utiliza `next/image` para la optimización de imágenes. Las Server Actions y el uso potencial de Server Components ayudan a reducir el JavaScript enviado al cliente.
*   **SEO**: Los metadatos básicos se definen en `src/app/layout.tsx`. Podría mejorarse con metadatos más dinámicos por página.

**¿El proyecto tiene un equipo o eres un desarrollador individual?**
Desarrollado en el entorno de Firebase Studio, asumiendo un contexto de desarrollo individual o con asistencia de IA.

**¿Hay alguna restricción o limitación importante?**
*   El stack tecnológico (Next.js, React, ShadCN UI, Tailwind CSS, Prisma, Genkit, PostgreSQL) está predefinido por el entorno de desarrollo y las elecciones del proyecto.
*   La dependencia de servicios externos (Supabase para almacenamiento, Google AI para Genkit, Prisma Accelerate) requiere conectividad y configuración adecuada de estos servicios.
```