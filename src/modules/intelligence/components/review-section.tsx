"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AiEvidenceSection } from "@/src/modules/intelligence/components/ai-evidence-section"
import { ReviewGroupsSection } from "@/src/modules/intelligence/components/review-groups-section"
import { INTELLIGENCE_SHEET_KEYS } from "@/src/modules/intelligence/constants/sheet-keys"
import {
  readReviewView,
  REVIEW_VIEW_QUERY_KEY,
  type ReviewView,
} from "@/src/modules/intelligence/review-view"
import {
  SegmentedControl,
  type SegmentOption,
} from "@/src/shared/components/forms/segmented-control"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { withTabQuery } from "@/src/shared/lib/tab-query"
import { Layers3, Mail } from "lucide-react"

const REVIEW_VIEW_OPTIONS: SegmentOption<ReviewView>[] = [
  { value: "groups", label: "Grupos", icon: Layers3 },
  { value: "messages", label: "Correos", icon: Mail },
]

type ReviewSectionProps = {
  enabled: boolean
  onOpenMessage: (messageId: string) => void
}

/** La pestaña Revisión: grupos por remitente y plantilla, o cola por correo. */
export function ReviewSection({ enabled, onOpenMessage }: ReviewSectionProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const reviewSheet = useSheetParam(INTELLIGENCE_SHEET_KEYS.review)
  const focusSheet = useSheetParam(INTELLIGENCE_SHEET_KEYS.focus)
  // Un enlace con la hoja de un correo abierta sigue mostrando la cola.
  const view: ReviewView =
    reviewSheet.open || focusSheet.open
      ? "messages"
      : readReviewView(searchParams.get(REVIEW_VIEW_QUERY_KEY))

  function changeView(nextView: ReviewView) {
    const url = withTabQuery(
      pathname,
      searchParams.toString(),
      REVIEW_VIEW_QUERY_KEY,
      nextView
    )
    if (url) {
      router.replace(url, { scroll: false })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        ariaLabel="Vista de revisión"
        value={view}
        onChange={changeView}
        options={REVIEW_VIEW_OPTIONS}
        fullWidth
      />
      {view === "groups" ? (
        <ReviewGroupsSection enabled={enabled} onOpenMessage={onOpenMessage} />
      ) : (
        <AiEvidenceSection
          enabled={enabled}
          view="review"
          onOpenMessage={onOpenMessage}
        />
      )}
    </div>
  )
}
