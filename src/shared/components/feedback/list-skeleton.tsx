import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { cn } from "@/src/shared/lib/utils"

/** Rows of a list while it loads. */
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 px-3 py-2" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  )
}

/** Card of a list while it loads; the height follows the card variant. */
export function CardSkeleton({
  height = 16,
  className,
}: {
  /** Height in Tailwind units (h-16, h-28, h-40). */
  height?: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-2xl border border-border bg-muted/40",
        className
      )}
      style={{ height: `${height * 0.25}rem` }}
    />
  )
}
