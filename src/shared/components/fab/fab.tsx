import { PlusIcon } from "lucide-react"

export function Fab({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="fixed right-4 bottom-24 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-xl disabled:opacity-50"
    >
      <PlusIcon className="size-5" aria-hidden />
    </button>
  )
}
