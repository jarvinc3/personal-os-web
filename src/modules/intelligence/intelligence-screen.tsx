"use client"

import { useIntelligenceMessage } from "@/src/modules/intelligence/hooks/use-intelligence"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Badge } from "@/src/shared/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { formatDate, formatDateTime } from "@/src/shared/lib/date-format"
import {
  AlertCircle,
  BrainCircuit,
  CalendarDays,
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
import { useCallback, useMemo, useState } from "react"
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
  const {
    dashboardQuery,
    messagesQuery,
    connectMutation,
    syncMutation,
    resetMutation,
  } = useIntelligence()
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
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
  const receivedRange = dashboard.receivedRange
  const syncProgress = connected ? dashboard.connection.syncProgress : null

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-10 md:px-6">
      <SummarySection
        title={connected ? "Gmail" : "Fuente de correo"}
        subtitle={
          connected
            ? dashboard.connection.emailAddress
            : "Conecta una cuenta para importar y revisar tus mensajes."
        }
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
              title="Cuenta conectada"
              description={
                !dashboard.connection.initialSyncCompletedAt
                  ? syncProgress?.status === "failed" ||
                    dashboard.connection.lastSyncErrorCode
                    ? "Sincronización detenida"
                    : dashboard.connection.lastSyncedAt
                      ? syncProgress?.status === "scheduled"
                        ? "Siguiente lote programado"
                        : "Sincronización inicial en curso"
                      : "La sincronización inicial está pendiente."
                  : "Historial inicial completo"
              }
              icon={Mail}
              value={
                dashboard.connection.lastSyncedAt
                  ? formatDateTime(dashboard.connection.lastSyncedAt)
                  : "Pendiente"
              }
              isLast={
                !dashboard.connection.lastSyncErrorCode &&
                syncProgress?.status !== "failed"
              }
            />
            <div className="flex flex-col gap-2">
              {syncProgress?.status === "failed" ||
              (dashboard.connection.lastSyncErrorCode && !syncProgress) ? (
                <Alert variant="warning" role="status">
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  <AlertTitle>La sincronización se detuvo</AlertTitle>
                  <AlertDescription>
                    {syncFailureMessage(syncProgress?.errorCategory)}
                  </AlertDescription>
                </Alert>
              ) : null}
              {syncProgress?.status === "scheduled" ? (
                <Alert variant="default" role="status">
                  <Clock3 className="size-4 shrink-0" aria-hidden="true" />
                  <AlertTitle>El siguiente lote está programado</AlertTitle>
                  <AlertDescription>
                    Este lote importó {syncProgress.importedThisRun} mensajes.
                    La sincronización continuará automáticamente
                    {syncProgress.nextRunAt
                      ? ` alrededor de ${formatDateTime(new Date(syncProgress.nextRunAt).toISOString())}`
                      : " en el próximo ciclo"}
                    .
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
                    {syncProgress?.status === "waiting"
                      ? `${syncProgress.errorCategory === "rate_limit" ? "Gmail alcanzó su límite temporal de solicitudes" : "Gmail pidió una pausa temporal"}. Reintento ${syncProgress.attempt} de 3${syncProgress.retryAt ? ` a las ${formatDateTime(new Date(syncProgress.retryAt).toISOString())}` : ""}.`
                      : syncProgress?.status === "retrying"
                        ? `Reintentando con Gmail · intento ${syncProgress.attempt} de 3.`
                        : syncProgress?.status === "running"
                          ? syncProgress.phase === "bootstrap"
                            ? `Leyendo el histórico desde el 1 de enero de 2026 · ${syncProgress.processedThisRun} correos procesados, ${syncProgress.importedThisRun} importados en este lote${syncProgress.totalEstimate ? ` · ${syncProgress.totalEstimate} estimados en total` : ""}.`
                            : syncProgress.phase === "recovery"
                              ? `Recuperando el cursor y leyendo correos · ${syncProgress.processedThisRun} procesados, ${syncProgress.importedThisRun} importados.`
                              : `Buscando cambios nuevos · ${syncProgress.processedThisRun} procesados, ${syncProgress.importedThisRun} importados.`
                          : `${dashboard.counters.importedMessages} mensajes importados`}
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => syncMutation.mutate()}
                disabled={
                  syncMutation.isPending || dashboard.connection.syncInProgress
                }
              >
                {syncMutation.isPending ||
                dashboard.connection.syncInProgress ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw aria-hidden="true" />
                )}
                {syncMutation.isPending || dashboard.connection.syncInProgress
                  ? "Sincronizando…"
                  : "Sincronizar ahora"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => connectMutation.mutate()}
                disabled={
                  connectMutation.isPending ||
                  dashboard.connection.syncInProgress
                }
              >
                {connectMutation.isPending ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Mail aria-hidden="true" />
                )}
                Reconectar Gmail
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setResetDialogOpen(true)}
                disabled={
                  resetMutation.isPending || dashboard.connection.syncInProgress
                }
              >
                Vaciar y reiniciar
              </Button>
            </div>
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

      {connected ? (
        <div
          className="flex flex-wrap gap-2"
          aria-label="Resumen de cobertura del correo"
        >
          <Badge variant="outline">
            <Mail data-icon="inline-start" />
            {dashboard.counters.importedMessages} correos
          </Badge>
          <Badge variant="outline">
            <Clock3 data-icon="inline-start" />
            {dashboard.counters.recentMessages} en 30 días
          </Badge>
          <Badge
            variant={
              dashboard.connection.initialSyncCompletedAt
                ? "success"
                : dashboard.connection.syncInProgress
                  ? "info"
                  : syncProgress?.status === "failed" ||
                      dashboard.connection.lastSyncErrorCode
                    ? "warning"
                    : "secondary"
            }
          >
            <CalendarDays data-icon="inline-start" />
            {dashboard.connection.initialSyncCompletedAt
              ? "Histórico completo desde 1 ene 2026"
              : dashboard.connection.syncInProgress
                ? "Importando desde 1 ene 2026"
                : syncProgress?.status === "failed" ||
                    dashboard.connection.lastSyncErrorCode
                  ? "Histórico detenido · desde 1 ene 2026"
                  : syncProgress?.status === "scheduled"
                    ? "Histórico en espera · desde 1 ene 2026"
                    : "Bootstrap pendiente · desde 1 ene 2026"}
          </Badge>
          <Badge variant="outline">
            Primer correo ·{" "}
            {receivedRange?.firstMessageAt
              ? formatDate(receivedRange.firstMessageAt)
              : "Sin dato"}
          </Badge>
          <Badge variant="outline">
            Más reciente ·{" "}
            {receivedRange?.latestMessageAt
              ? formatDate(receivedRange.latestMessageAt)
              : "Sin dato"}
          </Badge>
        </div>
      ) : null}

      {dashboard.role === "ADMIN" ? (
        <SummaryItem
          title="Administrar roles"
          description="Consulta y cambia los roles de Inteligencia."
          icon={ShieldCheck}
          href="/intelligence/admin/roles"
          showChevron
          isLast
        />
      ) : null}

      {connected ? (
        <Tabs
          defaultValue="messages"
          persistKey="intelligence-view"
          className="flex flex-col gap-3"
        >
          <TabsList className="w-full rounded-2xl bg-muted">
            <TabsTrigger value="messages" className="rounded-2xl py-3">
              <Mail aria-hidden="true" /> Correos
            </TabsTrigger>
            <TabsTrigger value="review" className="rounded-2xl py-3">
              <CheckCircle2 aria-hidden="true" /> Revisión
            </TabsTrigger>
            <TabsTrigger value="runs" className="rounded-2xl py-3">
              <Clock3 aria-hidden="true" /> Análisis
            </TabsTrigger>
          </TabsList>
          <TabsContent value="messages" className="flex flex-col gap-3">
            <SummarySection
              title="Correo"
              subtitle="Ordenado del más antiguo al más reciente."
              icon={Mail}
            >
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
          </TabsContent>
          <TabsContent value="review" className="flex flex-col gap-3">
            <AiEvidenceSection
              enabled={connected}
              view="review"
              onOpenMessage={(messageId) =>
                setMessageSheetOpen(true, messageId)
              }
            />
          </TabsContent>
          <TabsContent value="runs" className="flex flex-col gap-3">
            <AiEvidenceSection
              enabled={connected}
              view="runs"
              onOpenMessage={(messageId) =>
                setMessageSheetOpen(true, messageId)
              }
            />
          </TabsContent>
        </Tabs>
      ) : null}

      <IntelligenceMessageDetail
        messageId={selectedMessageId ?? ""}
        open={messageSheetOpen}
        onOpenChange={setMessageSheetOpen}
      />
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Vaciar el correo importado?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrarán los mensajes importados, sus particiones y revisiones,
              observaciones y ejecuciones de correo. Gmail seguirá conectado;
              después volveremos a sincronizar desde el 1 de enero de 2026.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={resetMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                resetMutation.mutate(undefined, {
                  onSuccess: () => {
                    setResetDialogOpen(false)
                    syncMutation.mutate()
                  },
                })
              }}
            >
              {resetMutation.isPending
                ? "Reiniciando…"
                : "Vaciar y sincronizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

function syncFailureMessage(
  category:
    | "authorization"
    | "configuration"
    | "rate_limit"
    | "temporary"
    | "unknown"
    | undefined
) {
  switch (category) {
    case "authorization":
      return "Google ya no acepta esta autorización. Usa Reconectar Gmail para renovar el acceso y continuar."
    case "configuration":
      return "La conexión OAuth no está configurada correctamente. Revisa la configuración de Gmail del backend."
    case "rate_limit":
      return "Gmail alcanzó su límite temporal. Espera un poco y pulsa Sincronizar ahora para reintentar."
    case "temporary":
      return "Gmail o la red no respondió a tiempo. Puedes reintentar la sincronización."
    default:
      return "Gmail no pudo completar la solicitud. Reintenta; si vuelve a fallar, reconecta la cuenta."
  }
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
