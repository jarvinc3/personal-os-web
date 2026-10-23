import { FlaskConicalIcon } from "lucide-react"

/**
 * PROVISIONAL (#272): fixed notice every gallery screen carries. Delete with
 * the gallery in #290.
 */
export function GalleryNotice() {
  return (
    <div
      role="status"
      className="sticky top-0 z-30 -mx-4 flex items-center gap-2 border-b border-warning/40 bg-warning/10 px-4 py-2 text-xs font-medium text-foreground backdrop-blur md:-mx-6"
    >
      <FlaskConicalIcon
        className="size-3.5 shrink-0 text-warning"
        aria-hidden
      />
      Galería provisional · datos de ejemplo
    </div>
  )
}
