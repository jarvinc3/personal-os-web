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
import {
  SummaryGroup,
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { Button } from "@/src/shared/components/ui/button"
import {
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

type EmailSignalSectionProps = {
  message: {
    id: string
    subject: string
    fromAddress: string
    receivedAt: string
    processingStatus: string
  }
}

export function EmailSignalSection({ message }: EmailSignalSectionProps) {
  const signalQuery = useEmailSignal(message.id)

  if (signalQuery.isPending) {
    return (
      <SummarySection
        title={SECTION_TITLE}
        subtitle={SECTION_SUBTITLE}
        icon={Radar}
      >
        <div
          className="flex flex-col gap-2 p-2"
          aria-label="Cargando la señal del correo"
        >
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </SummarySection>
    )
  }

  if (signalQuery.isError) {
    return (
      <SummarySection
        title={SECTION_TITLE}
        subtitle={SECTION_SUBTITLE}
        icon={Radar}
      >
        <Empty size="sm">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No se pudo cargar la señal</EmptyTitle>
            <EmptyDescription>
              El correo sigue disponible; reintenta la lectura.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void signalQuery.refetch()}
          >
            <RotateCcw aria-hidden="true" /> Reintentar
          </Button>
        </Empty>
      </SummarySection>
    )
  }

  const signal = signalQuery.data

  if (!signal) {
    const missing = missingSignalState(message.processingStatus)
    const MissingIcon = MISSING_SIGNAL_ICONS[missing.kind]

    return (
      <SummarySection
        title={SECTION_TITLE}
        subtitle={SECTION_SUBTITLE}
        icon={Radar}
      >
        <Empty size="sm">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MissingIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{missing.title}</EmptyTitle>
            <EmptyDescription>{missing.description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SummarySection>
    )
  }

  const routes = signalRouteRows(signal)
  const hasEvidence = signal.evidence.length > 0

  return (
    <SummarySection
      title={SECTION_TITLE}
      subtitle={SECTION_SUBTITLE}
      icon={Radar}
    >
      <SummaryItem
        title={signalTypeLabel(signal.type)}
        description={`Detectada ${formatDateTime(signal.detectedAt)} · ${formatSignalConfidence(signal.confidence)}`}
        value={signalStatusLabel(signal.status)}
        icon={ShieldCheck}
        isLast={!routes.length && !hasEvidence}
      />
      {routes.map((row, index) => (
        <SummaryItem
          key={row.route}
          title={row.title}
          description={row.description}
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
    </SummarySection>
  )
}
