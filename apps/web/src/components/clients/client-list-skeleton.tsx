"use client";

import { Card } from "@fieldpro/ui/components/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search bar skeleton */}
      <Skeleton className="h-10 w-full" />
      
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-16" />
      </div>

      {/* Table skeleton */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex gap-4 pb-4 border-b">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
          
          {/* Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}
