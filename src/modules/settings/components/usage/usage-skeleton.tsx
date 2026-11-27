"use client"

import { Card } from "@/src/shared/components/ui/card"
import { Skeleton } from "@/src/shared/components/ui/skeleton"

export function UsageSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Resumen
        </h2>
        <Card className="gap-0 bg-card p-1">
          <div className="flex flex-col gap-3 p-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </Card>
      </section>
      <Skeleton className="h-52 w-full rounded-2xl" />
      <Skeleton className="h-52 w-full rounded-2xl" />
    </div>
  )
}
