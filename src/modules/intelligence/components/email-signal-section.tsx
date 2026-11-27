"use client"

import {
  AlertCircle,
  Ban,
  CalendarDays,
  Clock3,
  FileSearch,
  Mail,
  Radar,
  RotateCcw,
  Route as RouteIcon,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { useEmailSignal } from "@/src/modules/intelligence/hooks/use-email-signal"
import {
  evidenceRuleLabel,
  evidenceSourceLabel,
  formatSignalConfidence,
  missingSignalState,
  signalRouteRows,
  signalStatusLabel,
  signalTypeLabel,
  type MissingSignalKind,
} from "@/src/modules/intelligence/signals"
import type { AiEmailMessageDetail } from "@/src/modules/intelligence/types/intelligence.types"
import type { EmailSignal } from "@/src/modules/intelligence/types/signal.types"
import {
  SummaryGroup,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { Button } from "@/src/shared/components/ui/button"
import {
  EMPTY_COMPACT_CLASS_NAME,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { cn } from "@/src/shared/lib/utils"
import { formatDateTime } from "@/src/shared/lib/date-format"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"

const SECTION_TITLE = "Señal detectada"
const SECTION_SUBTITLE =
  "Publicada por la inteligencia; no crea movimientos en Finanzas."

const MISSING_SIGNAL_ICONS: Record<MissingSignalKind, typeof Radar> = {
  pending: Clock3,
  failed: AlertCircle,
  discarded: Ban,
  none: Radar,
}

type EmailSignalMessage = Pick<
  AiEmailMessageDetail,
  "id" | "subject" | "fromAddress" | "receivedAt" | "processingStatus"
>

type EmailSignalSectionProps = {
  message: EmailSignalMessage
}

export function EmailSignalSection({ message }: EmailSignalSectionProps) {
  const {
    data: signal,
    isPending,
    isError,
    refetch,
  } = useEmailSignal(message.id)

  return (
    <SummarySection
      title={SECTION_TITLE}
      subtitle={SECTION_SUBTITLE}
      icon={Radar}
    >
      {isPending ? (
        <SignalSkeleton />
      ) : isError ? (
        <SignalLoadError onRetry={() => void refetch()} />
      ) : signal ? (
        <SignalDetail message={message} signal={signal} />
      ) : (
        <SignalMissing processingStatus={message.processingStatus} />
      )}
    </SummarySection>
  )
}

function SignalSkeleton() {
  return (
    <div
      className="flex flex-col gap-2 p-2"
      aria-label="Cargando la señal del correo"
    >
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

function SignalLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <Empty className={EMPTY_COMPACT_CLASS_NAME}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No se pudo cargar la señal</EmptyTitle>
        <EmptyDescription>
          El correo sigue disponible; reintenta la lectura.
        </EmptyDescription>
      </EmptyHeader>
      <Button type="button" size="sm" variant="outline" onClick={onRetry}>
        <RotateCcw aria-hidden="true" /> Reintentar
      </Button>
    </Empty>
  )
}

function SignalMissing({
  processingStatus,
}: {
  processingStatus: EmailSignalMessage["processingStatus"]
}) {
  const missingSignal = missingSignalState(processingStatus)
  const MissingIcon = MISSING_SIGNAL_ICONS[missingSignal.kind]

  return (
    <Empty className={EMPTY_COMPACT_CLASS_NAME}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MissingIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{missingSignal.title}</EmptyTitle>
        <EmptyDescription>{missingSignal.description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function SignalDetail({
  message,
  signal,
}: {
  message: EmailSignalMessage
  signal: EmailSignal
}) {
  const formatLocale = useFormatLocale()
  const routes = signalRouteRows(signal)
  const hasEvidence = signal.evidence.length > 0

  return (
    <>
      <Item
        variant="plain"
        className={cn(
          !(!routes.length && !hasEvidence) && "border-b border-border/60"
        )}
      >
        <ItemMedia variant="icon">
          <ShieldCheck />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{signalTypeLabel(signal.type)}</ItemTitle>
          <ItemDescription className="truncate text-xs">
            {`Detectada ${formatDateTime(signal.detectedAt, formatLocale)} · ${formatSignalConfidence(signal.confidence)}`}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <span className="text-sm font-semibold tabular-nums">
            {signalStatusLabel(signal.status)}
          </span>
        </ItemActions>
      </Item>
      {routes.map((route, index) => (
        <Item
          key={route.route}
          variant="plain"
          className={cn(
            !(index === routes.length - 1 && !hasEvidence) &&
              "border-b border-border/60"
          )}
        >
          <ItemMedia variant="icon">
            <RouteIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{route.title}</ItemTitle>
            <ItemDescription className="truncate text-xs">
              {route.description}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
      {hasEvidence ? (
        <SummaryGroup title="Evidencia usada">
          <Item variant="plain" className={"border-b border-border/60"}>
            <ItemMedia variant="icon">
              <UserRound />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{"Remitente"}</ItemTitle>
              <ItemDescription className="line-clamp-none text-xs break-words whitespace-normal">
                {message.fromAddress}
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item variant="plain" className={"border-b border-border/60"}>
            <ItemMedia variant="icon">
              <Mail />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{"Asunto"}</ItemTitle>
              <ItemDescription className="line-clamp-none text-xs break-words whitespace-normal">
                {message.subject}
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item variant="plain" className={"border-b border-border/60"}>
            <ItemMedia variant="icon">
              <CalendarDays />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{"Fecha del correo"}</ItemTitle>
              <ItemDescription className="truncate text-xs">
                {formatDateTime(message.receivedAt, formatLocale)}
              </ItemDescription>
            </ItemContent>
          </Item>
          {signal.evidence.map((evidence, index) => (
            <Item
              key={`${evidence.sourceType}-${evidence.sourceId}`}
              variant="plain"
              className={cn(
                !(index === signal.evidence.length - 1) &&
                  "border-b border-border/60"
              )}
            >
              <ItemMedia variant="icon">
                <FileSearch />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {evidenceSourceLabel(evidence.sourceType)}
                </ItemTitle>
                <ItemDescription className="line-clamp-none text-xs break-words whitespace-normal">
                  {`Regla: ${evidenceRuleLabel(evidence)}`}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </SummaryGroup>
      ) : null}
    </>
  )
}
