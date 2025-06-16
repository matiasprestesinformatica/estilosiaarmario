
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StyleSuggestionSectionSkeleton() {
  return (
    <div className="mt-6 p-4 border rounded-md bg-secondary/30 space-y-4">
      <div>
        <Skeleton className="h-6 w-1/3 mb-2" /> {/* Atuendo Sugerido Title */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </div>
      <div>
        <Skeleton className="h-5 w-1/4 mb-2" /> {/* Prendas Usadas Title */}
        <div className="space-y-1.5 pl-5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div>
        <Skeleton className="h-5 w-1/4 mb-2" /> {/* Razonamiento Title */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-1" />
      </div>
    </div>
  );
}
