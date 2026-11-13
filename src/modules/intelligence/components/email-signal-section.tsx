"use client"

import {
  AlertCircle,
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
import type { EmailSignal } from "@/src/modules/intelligence/types/signal.types"
import {
  SummaryGroup,
  SummaryItem,
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
import { formatDateTime } from "@/src/shared/lib/date-format"

const SECTION_TITLE = "Señal detectada"
const SECTION_SUBTITLE =
  "Publicada por la inteligencia; no crea movimientos en Finanzas."

const MISSING_SIGNAL_ICONS: Record<MissingSignalKind, typeof Radar> = {
  pending: Clock3,
  failed: AlertCircle,
  none: Radar,
}

type EmailSignalMessage = {
  id: string
  subject: string
  fromAddress: string
  receivedAt: string
  processingStatus: string
}

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

function SignalMissing({ processingStatus }: { processingStatus: string }) {
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
  const routes = signalRouteRows(signal)
  const hasEvidence = signal.evidence.length > 0

  return (
    <>
      <SummaryItem
        title={signalTypeLabel(signal.type)}
        description={`Detectada ${formatDateTime(signal.detectedAt)} · ${formatSignalConfidence(signal.confidence)}`}
        value={signalStatusLabel(signal.status)}
        icon={ShieldCheck}
        isLast={!routes.length && !hasEvidence}
      />
      {routes.map((route, index) => (
        <SummaryItem
          key={route.route}
          title={route.title}
          description={route.description}
          icon={RouteIcon}
          isLast={index === routes.length - 1 && !hasEvidence}
        />
      ))}
      {hasEvidence ? (
        <SummaryGroup title="Evidencia usada">
          <SummaryItem
            title="Remitente"
            description={message.fromAddress}
            wrapDescription
            icon={UserRound}
          />
          <SummaryItem
            title="Asunto"
            description={message.subject}
            wrapDescription
            icon={Mail}
          />
          <SummaryItem
            title="Fecha del correo"
            description={formatDateTime(message.receivedAt)}
            icon={CalendarDays}
          />
          {signal.evidence.map((evidence, index) => (
            <SummaryItem
              key={`${evidence.sourceType}-${evidence.sourceId}`}
              title={evidenceSourceLabel(evidence.sourceType)}
              description={`Regla: ${evidenceRuleLabel(evidence)}`}
              wrapDescription
              icon={FileSearch}
              isLast={index === signal.evidence.length - 1}
            />
          ))}
        </SummaryGroup>
      ) : null}
    </>
  )
}
