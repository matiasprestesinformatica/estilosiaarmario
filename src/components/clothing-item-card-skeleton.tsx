
"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ClothingItemCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0 relative">
        <Skeleton className="w-full h-60 rounded-t-md" />
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-3">
        <Skeleton className="h-6 w-3/4" /> {/* Title */}
        <Skeleton className="h-4 w-1/4" /> {/* Badge */}
        <Skeleton className="h-4 w-1/2" /> {/* Description line 1 */}
        <Skeleton className="h-4 w-2/3" /> {/* Date added */}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-end gap-2">
        <Skeleton className="h-9 w-20" /> {/* Edit Button */}
        <Skeleton className="h-9 w-24" /> {/* Delete Button */}
      </CardFooter>
    </Card>
  );
}
