import { Skeleton } from "@/src/shared/components/ui/skeleton"

export function KnowledgeListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2" aria-label="Cargando conocimiento">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  )
}
