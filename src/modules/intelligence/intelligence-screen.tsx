"use client"

import { useIntelligenceMessage } from "@/src/modules/intelligence/hooks/use-intelligence"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { formatDateTime } from "@/src/shared/lib/date-format"
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Inbox,
  LoaderCircle,
  Mail,
  RefreshCw,
  ShieldCheck,
  Unplug,
  X,
} from "lucide-react"
import { useCallback, useMemo } from "react"
import { useIntelligence } from "./hooks/use-intelligence"
import { AiEvidenceSection } from "./components/ai-evidence-section"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"

export function IntelligenceScreen() {
  return <IntelligenceScreenBody />
}

function IntelligenceScreenBody() {
  const { dashboardQuery, messagesQuery, connectMutation, syncMutation } =
    useIntelligence()
  const {
    open: messageSheetOpen,
    sheetId: selectedMessageId,
    setOpen: setMessageSheetOpen,
  } = useSheetParam("intelligence-message")
  usePageHeader({ title: "Inteligencia" })

  const messages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [messagesQuery.data?.pages]
  )
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = messagesQuery
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  if (dashboardQuery.isPending) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-10 md:px-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </main>
    )
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-10 md:px-6">
        <SummarySection title="Inteligencia" icon={BrainCircuit}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No se pudo cargar Inteligencia</EmptyTitle>
              <EmptyDescription>
                Revisa tu conexión e inténtalo otra vez.
              </EmptyDescription>
            </EmptyHeader>
            <Button type="button" onClick={() => void dashboardQuery.refetch()}>
              <RefreshCw aria-hidden="true" /> Reintentar
            </Button>
          </Empty>
        </SummarySection>
      </main>
    )
  }

  const dashboard = dashboardQuery.data
  const connected = dashboard.connection.connected

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-10 md:px-6">
      <SummarySection
        title="Fuente de correo"
        subtitle="Gmail permanece aislado en tu cuenta."
        icon={Mail}
        right={
          connected ? (
            <span role="img" aria-label="Gmail conectado">
              <CheckCircle2
                className="size-5 text-emerald-600"
                aria-hidden="true"
              />
            </span>
          ) : (
            <span role="img" aria-label="Gmail desconectado">
              <Unplug
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
            </span>
          )
        }
      >
        {connected ? (
          <>
            <SummaryItem
              title={dashboard.connection.emailAddress}
              description={
                !dashboard.connection.initialSyncCompletedAt
                  ? dashboard.connection.lastSyncErrorCode
                    ? `Sincronización detenida`
                    : dashboard.connection.lastSyncedAt
                      ? `Sincronización inicial en curso`
                      : "La sincronización inicial está pendiente."
                  : dashboard.connection.lastSyncedAt
                    ? `Última sincronización: ${formatDateTime(dashboard.connection.lastSyncedAt)}`
                    : "La sincronización inicial está pendiente."
              }
              icon={Mail}
              value={`${dashboard.counters.importedMessages} mensajes `}
              isLast={!dashboard.connection.lastSyncErrorCode}
            />
            <div className="flex flex-col gap-2">
              {dashboard.connection.lastSyncErrorCode &&
              !dashboard.connection.syncInProgress ? (
                <Alert variant="warning" role="status">
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  <AlertTitle>La sincronización se detuvo.</AlertTitle>
                  <AlertDescription>
                    Pulsa Sincronizar ahora para continuar.
                  </AlertDescription>
                </Alert>
              ) : null}
              {dashboard.connection.syncInProgress ? (
                <Alert variant="default" role="status">
                  <LoaderCircle
                    className="size-4 shrink-0 animate-spin"
                    aria-hidden="true"
                  />
                  <AlertTitle>Sincronizando correo</AlertTitle>
                  <AlertDescription>
                    {dashboard.connection.syncProgress?.status === "waiting"
                      ? `En espera de Gmail por límite temporal · reintento ${dashboard.connection.syncProgress.attempt} de 3`
                      : dashboard.connection.syncProgress?.status === "retrying"
                        ? `Reintentando con Gmail · intento ${dashboard.connection.syncProgress.attempt} de 3`
                        : `${dashboard.counters.importedMessages} mensajes importados`}
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
            <Button
              type="button"
              className="flex-1"
              onClick={() => syncMutation.mutate()}
              disabled={
                syncMutation.isPending || dashboard.connection.syncInProgress
              }
            >
              {syncMutation.isPending || dashboard.connection.syncInProgress ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw aria-hidden="true" />
              )}
              {syncMutation.isPending || dashboard.connection.syncInProgress
                ? "Sincronizando…"
                : "Sincronizar ahora"}
            </Button>
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Mail aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Conecta tu correo</EmptyTitle>
              <EmptyDescription>
                El bootstrap empieza el 1 de enero de 2026. Puedes revocar el
                consentimiento desde Privacidad.
              </EmptyDescription>
            </EmptyHeader>
            <Button
              type="button"
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
            >
              {connectMutation.isPending ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Mail aria-hidden="true" />
              )}
              Conectar Gmail
            </Button>
          </Empty>
        )}
      </SummarySection>

      <SummarySection title="Corpus personal" icon={Inbox}>
        <SummaryItem
          title="Mensajes importados"
          description="Contenido canónico persistido para esta cuenta."
          icon={Inbox}
          value={String(dashboard.counters.importedMessages)}
        />
        <SummaryItem
          title="Últimos 30 días"
          description="Mensajes recibidos en el periodo."
          icon={Clock3}
          value={String(dashboard.counters.recentMessages)}
          isLast
        />
      </SummarySection>

      {dashboard.role === "ADMIN" ? (
        <SummarySection title="Administración de roles" icon={ShieldCheck}>
          <SummaryItem
            title="Administrar roles"
            description="Consulta y cambia los roles de Inteligencia."
            icon={ShieldCheck}
            href="/intelligence/admin/roles"
            showChevron
            isLast
          />
        </SummarySection>
      ) : null}

      <AiEvidenceSection
        enabled={connected}
        onOpenMessage={(messageId) => setMessageSheetOpen(true, messageId)}
      />

      {connected ? (
        <SummarySection title="Mensajes" subtitle="Solo lectura" icon={Mail}>
          {messagesQuery.isPending ? (
            <div
              className="flex flex-col gap-2 p-2"
              aria-label="Cargando mensajes"
            >
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : messagesQuery.isError ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertCircle aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No se pudieron cargar los mensajes</EmptyTitle>
                <EmptyDescription>
                  Los mensajes ya cargados siguen disponibles.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                type="button"
                onClick={() => void messagesQuery.refetch()}
              >
                <RefreshCw aria-hidden="true" /> Reintentar
              </Button>
            </Empty>
          ) : messages.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Aún no hay mensajes</EmptyTitle>
                <EmptyDescription>
                  La sincronización agregará aquí el correo desde 2026.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {messages.map((message) => (
                <SummaryItem
                  key={message.id}
                  title={message.subject}
                  description={`${message.fromAddress} · ${formatDateTime(message.receivedAt)}`}
                  icon={Mail}
                  onPress={() => setMessageSheetOpen(true, message.id)}
                  showChevron
                />
              ))}
              <InfiniteListSentinel
                hasNextPage={Boolean(messagesQuery.hasNextPage)}
                isFetchingNextPage={messagesQuery.isFetchingNextPage}
                onLoadMore={loadMore}
              />
            </>
          )}
        </SummarySection>
      ) : null}

      <IntelligenceMessageDetail
        messageId={selectedMessageId ?? ""}
        open={messageSheetOpen}
        onOpenChange={setMessageSheetOpen}
      />
    </main>
  )
}

function IntelligenceMessageDetail({
  messageId,
  open,
  onOpenChange,
}: {
  messageId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data, isPending, isError, refetch } =
    useIntelligenceMessage(messageId)

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={data?.subject ?? "Detalle del mensaje"}
      description={
        data
          ? `${data.fromAddress} · ${formatDateTime(data.receivedAt)}`
          : undefined
      }
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <X aria-hidden="true" /> Cerrar
          </Button>
        ),
      }}
    >
      {isPending ? (
        <div className="flex flex-col gap-2 p-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : isError || !data ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No se pudo cargar el mensaje</EmptyTitle>
            <EmptyDescription>
              El contenido no está disponible ahora.
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" onClick={() => void refetch()}>
            <RefreshCw aria-hidden="true" /> Reintentar
          </Button>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4 p-2">
          <MessageRepresentation
            title="Canónica"
            value={data.content?.canonicalBody}
          />
          <MessageRepresentation
            title="Saneada"
            value={data.content?.sanitizedBody}
          />
          <MessageRepresentation
            title="Cruda (retención limitada)"
            value={data.content?.rawBody}
          />
          <SummarySection
            title="Procedencia y verificaciones"
            subtitle="Registros append-only vinculados al correo original."
          >
            {data.provenance.observations.map((observation) => (
              <SummaryItem
                key={`observation-${observation.sequence}`}
                title={`Observación ${observation.sequence}`}
                description={`${observation.knowledgeType} · ${observation.proposedScope} · ${observation.knowledgeKey}`}
                icon={BrainCircuit}
              />
            ))}
            {data.provenance.verifications.map((verification, index) => (
              <SummaryItem
                key={`verification-${verification.sequence}`}
                title={`Verificación ${verification.sequence} · ${verification.verdict}`}
                description={`${verification.verifierRole}${verification.isGroundTruth ? " · verdad de referencia HOLDOUT" : ""}${verification.notes ? ` · ${verification.notes}` : ""}`}
                icon={CheckCircle2}
                isLast={index === data.provenance.verifications.length - 1}
              />
            ))}
            {!data.provenance.observations.length &&
            !data.provenance.verifications.length ? (
              <p className="px-2 text-sm text-muted-foreground">
                Este correo aún no tiene observaciones ni verificaciones.
              </p>
            ) : null}
          </SummarySection>
        </div>
      )}
    </BottomSheet>
  )
}

function MessageRepresentation({
  title,
  value,
}: {
  title: string
  value: string | null | undefined
}) {
  return (
    <section className="flex flex-col gap-1">
      <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
      <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 font-sans text-sm wrap-break-word whitespace-pre-wrap">
        {value || "No disponible"}
      </pre>
    </section>
  )
}
