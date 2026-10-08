import { Skeleton } from "@/src/shared/components/ui/skeleton"

type NotificationListSkeletonProps = {
  sections?: number
}

export function NotificationListSkeleton({
  sections = 2,
}: NotificationListSkeletonProps) {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {Array.from({ length: sections }, (_, sectionIndex) => (
        <div key={sectionIndex} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border p-4">
            {Array.from({ length: 3 }, (_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-3">
                <Skeleton className="size-12 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
