import { cn } from "@/src/shared/lib/utils"
import type { ReactNode } from "react"

type GalleryDemoProps = {
  /** Nombre del componente, como se exporta. */
  name: string
  /** Ruta de importación real, la que copia quien reutiliza el componente. */
  importPath: string
  /** Variantes y estados que se ven en el bloque. */
  states: string
  note?: string
  className?: string
  children: ReactNode
}

/** Ficha de un componente compartido: nombre, ruta y el componente real (#307). */
export function GalleryDemo({
  name,
  importPath,
  states,
  note,
  className,
  children,
}: GalleryDemoProps) {
  return (
    <article className="flex min-w-0 flex-col gap-2 rounded-2xl border border-border bg-card p-3">
      <header className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="text-sm font-medium text-foreground">{name}</h3>
          <p className="min-w-0 text-xs text-muted-foreground">{states}</p>
        </div>
        <code className="block w-full overflow-x-auto rounded-md bg-muted px-2 py-1 text-[0.7rem] whitespace-nowrap text-muted-foreground">
          {importPath}
        </code>
        {note ? (
          <p className="text-xs break-words text-muted-foreground">{note}</p>
        ) : null}
      </header>
      <div className={cn("flex min-w-0 flex-col gap-3", className)}>
        {children}
      </div>
    </article>
  )
}
