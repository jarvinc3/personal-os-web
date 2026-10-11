"use client"

import { Spinner } from "@/src/shared/components/ui/spinner"
import { cn } from "@/src/shared/lib/utils"
import { useLinkStatus } from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

type PendingSurfaceProps = {
  className?: string
  spinnerClassName?: string
}

export function PendingSurface({
  className,
  spinnerClassName,
}: PendingSurfaceProps) {
  return (
    <span
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/50",
        className
      )}
    >
      <Spinner className={spinnerClassName} />
    </span>
  )
}

/** Must render as a descendant of `next/link` `Link`. */
export function LinkPendingOverlay(props: PendingSurfaceProps) {
  const { pending } = useLinkStatus()
  if (!pending) {
    return null
  }
  return <PendingSurface {...props} />
}

export function usePendingNavigation() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href)
    })
  }

  return { navigate, isPending, startTransition }
}
