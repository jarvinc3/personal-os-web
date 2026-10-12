import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { ArrowLeftIcon, type LucideIcon } from "lucide-react"
import Link from "next/link"

type MissingRecordProps = {
  icon: LucideIcon
  title: string
  description: string
  backHref: string
  backLabel: string
}

export function MissingRecord({
  icon: Icon,
  title,
  description,
  backHref,
  backLabel,
}: MissingRecordProps) {
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" asChild>
          <Link href={backHref} className="relative">
            <ArrowLeftIcon className="size-4 shrink-0" />
            {backLabel}
            <LinkPendingOverlay />
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
