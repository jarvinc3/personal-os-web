"use client"

import { SettingsSection } from "@/src/shared/components/settings/settings-section"
import { Skeleton } from "@/src/shared/components/ui/skeleton"

export function UsageSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <SettingsSection title="Resumen">
        <div className="flex flex-col gap-3 p-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </SettingsSection>
      <Skeleton className="h-52 w-full rounded-2xl" />
      <Skeleton className="h-52 w-full rounded-2xl" />
    </div>
  )
}
