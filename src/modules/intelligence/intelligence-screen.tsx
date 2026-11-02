"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useIntelligenceMessage } from "@/src/modules/intelligence/hooks/use-intelligence"
import { INTELLIGENCE_SHEET_KEYS } from "@/src/modules/intelligence/constants/sheet-keys"
import { MESSAGE_RETURN_TRANSACTION_QUERY_KEY } from "@/src/modules/intelligence/constants"
import { shouldReturnToTransactionOnMessageClose } from "@/src/modules/intelligence/lib/message-return"
import { shortMessageId } from "@/src/modules/intelligence/message-id"
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
  FileText,
  Wifi,
  WifiOff,
  RefreshCw,
  ShieldCheck,
  Unplug,
  X,
  Trash2,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useIntelligence } from "./hooks/use-intelligence"
import {
  getMessagesRateLimitError,
  MESSAGES_RATE_LIMIT_MAX_AUTO_RETRIES,
  messagesRateLimitDelayMs,
} from "./messages-rate-limit"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { AiEvidenceSection } from "./components/ai-evidence-section"
import { EmailSignalSection } from "./components/email-signal-section"
import { ReviewSection } from "./components/review-section"
import {
  describeVerificationPayload,
  ROUTE_LABELS,
  SEMANTIC_TYPE_LABELS,
} from "./review-labels"
import { describeSyncFailure, resolveDashboardSyncFailure } from "./sync-status"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"

export function IntelligenceScreen() {
  return <IntelligenceScreenBody />
}

function IntelligenceScreenBody() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    dashboardQuery,
    oauthDiagnosticsQuery,
    messagesQuery,
    hasPendingMessageUpdates,
    refreshMessages,
    loadNextMessagesPage,
    connectMutation,
    syncMutation,
    resetMutation,
    emailSocketStatus,
  } = useIntelligence()
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const {
    open: messageSheetOpen,
    sheetId: selectedMessageId,
    setOpen: setMessageSheetOpen,
  } = useSheetParam(INTELLIGENCE_SHEET_KEYS.message, { closeMode: "replace" })
  const returnToTransactionId = searchParams.get(
    MESSAGE_RETURN_TRANSACTION_QUERY_KEY
  )
  const handleMessageSheetOpenChange = useCallback(
    (open: boolean) => {
      if (
        shouldReturnToTransactionOnMessageClose(open, returnToTransactionId)
      ) {
        router.back()
        return
      }
      setMessageSheetOpen(open)
    },
    [returnToTransactionId, router, setMessageSheetOpen]
  )
  usePageHeader({ title: "Inteligencia" })

  const messages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [messagesQuery.data?.pages]
  )
  const {
    hasNextPage,
    isFetching: isFetchingMessages,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = messagesQuery
  const messagesRateLimitError = getMessagesRateLimitError(messagesQuery.error)
  const messagesRateLimitAttemptsRef = useRef(0)
  const messagesRetryInProgress = isFetchingMessages || isFetchingNextPage
  const retryMessages = useCallback(() => {
    if (hasNextPage && messages.length > 0) {
      void loadNextMessagesPage()
      return
    }
    void refetchMessages()
  }, [hasNextPage, loadNextMessagesPage, messages.length, refetchMessages])
  const retryMessagesNow = useCallback(() => {
    messagesRateLimitAttemptsRef.current = 0
    retryMessages()
  }, [retryMessages])
  const queryProgress = dashboardQuery.data?.connection.connected
    ? dashboardQuery.data.connection.syncProgress
    : null
  const retryAt =
    queryProgress && ["waiting", "retrying"].includes(queryProgress.status)
      ? queryProgress.retryAt
      : undefined
  const now = useRetryClock(retryAt)
  useEffect(() => {
    if (!messagesRateLimitError) {
      messagesRateLimitAttemptsRef.current = 0
      return
    }
    if (
      messagesRetryInProgress ||
      messagesRateLimitAttemptsRef.current >=
        MESSAGES_RATE_LIMIT_MAX_AUTO_RETRIES
    ) {
      return
    }
    const timer = window.setTimeout(
      () => {
        messagesRateLimitAttemptsRef.current += 1
        retryMessages()
      },
      messagesRateLimitDelayMs({
        error: messagesRateLimitError,
        attempt: messagesRateLimitAttemptsRef.current,
      })
    )
    return () => {
      window.clearTimeout(timer)
    }
  }, [messagesRateLimitError, messagesRetryInProgress, retryMessages])
  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || messagesQuery.error) {
      return
    }
    void loadNextMessagesPage()
  }, [
    hasNextPage,
    isFetchingNextPage,
    loadNextMessagesPage,
    messagesQuery.error,
  ])

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
  const connection = dashboard.connection
  const requiresReconnect = connection.connected && connection.requiresReconnect
  const syncProgress = connection.connected ? connection.syncProgress : null
  const oauthIncomplete =
    connection.connected && oauthDiagnosticsQuery.data?.configured === false
  const syncFailure = resolveDashboardSyncFailure({
    connection,
    progress: syncProgress,
  })
  const syncFailed = Boolean(syncFailure)
  const syncWarning = syncFailed || oauthIncomplete || requiresReconnect
  const syncWaiting =
    !oauthIncomplete &&
    (syncProgress?.status === "waiting" || syncProgress?.status === "retrying")
  const syncing =
    !syncWarning &&
    ((connection.connected &&
      (connection.syncInProgress ||
        (!connection.initialSyncCompletedAt && !syncFailed))) ||
      syncProgress?.status === "running" ||
      syncProgress?.status === "scheduled")
  const attemptedAt = syncFailure?.occurredAt
    ? formatDateTime(syncFailure.occurredAt)
    : null
  const failureCopy = syncFailure
    ? describeSyncFailure({
        failure: syncFailure,
        attemptedAt,
        requiresReconnect,
      })
    : null

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-10 md:px-6">
      <SummarySection
        title={connected ? "Gmail" : "Fuente de correo"}
        subtitle={
          connected
            ? connectionSubtitle({
                emailAddress: dashboard.connection.emailAddress,
                requiresReconnect,
                oauthIncomplete,
                syncFailed,
                syncWaiting,
                syncing,
              })
            : "Conecta una cuenta para importar y revisar tus mensajes."
        }
        icon={Mail}
        collapsible={connected}
        right={
          connected ? (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5"
                aria-live="polite"
                aria-label={emailSocketStatusLabel(emailSocketStatus)}
                title={emailSocketStatusLabel(emailSocketStatus)}
              >
                {emailSocketStatus === "connected" ? (
                  <Wifi
                    className="size-3.5 text-emerald-600"
                    aria-hidden="true"
                  />
                ) : emailSocketStatus === "connecting" ? (
                  <LoaderCircle
                    className="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <WifiOff
                    className="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                {emailSocketStatus === "connected"
                  ? "Canal en vivo"
                  : emailSocketStatus === "connecting"
                    ? "Conectando canal"
                    : "Canal sin conexión"}
              </Badge>
              <span
                role="img"
                aria-label={
                  oauthIncomplete
                    ? "Gmail conectado con configuración OAuth incompleta"
                    : requiresReconnect
                      ? "Gmail conectado y requiere reconexión"
                      : syncFailed
                        ? "Gmail conectado con la última sincronización fallida"
                        : "Gmail conectado"
                }
              >
                {syncWarning ? (
                  <AlertCircle
                    className="size-5 text-amber-600"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2
                    className="size-5 text-emerald-600"
                    aria-hidden="true"
                  />
                )}
              </span>
            </div>
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
              title="Historial inicial"
              description={
                dashboard.connection.initialSyncCompletedAt
                  ? "Completo desde 1 ene 2026"
                  : syncWarning
                    ? "Incompleto · la sincronización se detuvo"
                    : syncing
                      ? "Importando desde 1 ene 2026"
                      : "Pendiente"
              }
              icon={CalendarDays}
              value={
                receivedRange?.firstMessageAt
                  ? formatDate(receivedRange.firstMessageAt)
                  : "Sin correos"
              }
            />
            <SummaryItem
              title="Última sincronización"
              description={
                oauthIncomplete
                  ? "No puede correr: falta configuración OAuth"
                  : requiresReconnect
                    ? "Detenida: reconecta Gmail"
                    : syncFailed
                      ? "Falló"
                      : syncWaiting
                        ? "Esperando reintento de Gmail"
                        : syncProgress?.status === "running"
                          ? "En curso"
                          : syncProgress?.status === "scheduled"
                            ? "Correcta; siguiente lote programado"
                            : dashboard.connection.lastSyncedAt
                              ? "Correcta"
                              : "Sin intentos"
              }
              icon={RefreshCw}
              value={
                syncFailure?.occurredAt
                  ? formatDateTime(syncFailure.occurredAt)
                  : dashboard.connection.lastSyncedAt
                    ? formatDateTime(dashboard.connection.lastSyncedAt)
                    : "Pendiente"
              }
              isLast
            />

            <div className="flex flex-col gap-2">
              {oauthIncomplete ? (
                <Alert variant="warning" role="status">
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  <AlertTitle>Configuración OAuth incompleta</AlertTitle>
                  <AlertDescription>
                    El backend no tiene completas las variables de Gmail. La
                    sincronización automática no puede correr y la cuenta no
                    está al día. Revisa la configuración y reinicia el API; no
                    hace falta reconectar.
                    {failureCopy
                      ? ` Último intento: ${attemptedAt ?? "sin hora"} · código ${syncFailure?.code}.`
                      : null}
                  </AlertDescription>
                </Alert>
              ) : failureCopy ? (
                <Alert variant="warning" role="status">
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  <AlertTitle>{failureCopy.title}</AlertTitle>
                  <AlertDescription>{failureCopy.description}</AlertDescription>
                  {failureCopy.offerReconnect ? (
                    <AlertAction>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => connectMutation.mutate()}
                        disabled={connectMutation.isPending}
                      >
                        {connectMutation.isPending ? (
                          <LoaderCircle
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Mail aria-hidden="true" />
                        )}
                        Reconectar
                      </Button>
                    </AlertAction>
                  ) : null}
                </Alert>
              ) : null}
              {syncProgress?.status === "scheduled" && !oauthIncomplete ? (
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
              {!oauthIncomplete &&
              (dashboard.connection.syncInProgress || syncWaiting) ? (
                <Alert variant="default" role="status">
                  <LoaderCircle
                    className="size-4 shrink-0 animate-spin"
                    aria-hidden="true"
                  />
                  <AlertTitle>Sincronizando correo</AlertTitle>
                  <AlertDescription>
                    {syncProgress?.status === "waiting"
                      ? `${syncProgress.errorCategory === "rate_limit" ? "Gmail alcanzó su límite temporal de solicitudes" : "Gmail pidió una pausa temporal"}. Reintento ${syncProgress.attempt} de 3.`
                      : syncProgress?.status === "retrying"
                        ? `Enviando reintento a Gmail · intento ${syncProgress.attempt} de 3.`
                        : syncProgress?.status === "running"
                          ? syncProgress.phase === "bootstrap"
                            ? `Leyendo el histórico desde el 1 de enero de 2026 · ${syncProgress.processedThisRun} correos procesados, ${syncProgress.importedThisRun} importados en este lote${syncProgress.totalEstimate ? ` · ${syncProgress.totalEstimate} estimados en total` : ""}.`
                            : syncProgress.phase === "recovery"
                              ? `Recuperando el cursor y leyendo correos · ${syncProgress.processedThisRun} procesados, ${syncProgress.importedThisRun} importados.`
                              : `Buscando cambios nuevos · ${syncProgress.processedThisRun} procesados, ${syncProgress.importedThisRun} importados.`
                          : `${dashboard.counters.importedMessages} mensajes importados`}
                    {(syncProgress?.status === "waiting" ||
                      syncProgress?.status === "retrying") &&
                    syncProgress.retryAt ? (
                      <div className="mt-2 flex">
                        <Badge
                          variant="secondary"
                          className="h-7 gap-1.5 px-3 font-mono text-sm tabular-nums"
                          aria-live="off"
                        >
                          <Clock3 className="size-3.5" aria-hidden="true" />
                          {formatRetryCountdown(syncProgress.retryAt, now)}
                        </Badge>
                      </div>
                    ) : null}
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="flex-1"
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
                  : "Sincronizar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
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
                Reconectar
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => setResetDialogOpen(true)}
                disabled={
                  resetMutation.isPending || dashboard.connection.syncInProgress
                }
              >
                <Trash2 aria-hidden="true" />
                Vaciar
              </Button>
            </div>
            <div
              className="flex flex-wrap gap-2"
              aria-label="Resumen de cobertura del correo"
            >
              <Badge variant="outline">
                <Mail data-icon="inline-start" />
                {dashboard.counters.importedMessages} correos
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
                      : syncWarning
                        ? "warning"
                        : "secondary"
                }
              >
                <CalendarDays data-icon="inline-start" />
                {dashboard.connection.initialSyncCompletedAt
                  ? "Histórico inicial completo · desde 1 ene 2026"
                  : dashboard.connection.syncInProgress
                    ? "Importando desde 1 ene 2026"
                    : syncWarning
                      ? "Histórico detenido · desde 1 ene 2026"
                      : syncProgress?.status === "scheduled"
                        ? "Histórico en espera · desde 1 ene 2026"
                        : "Bootstrap pendiente · desde 1 ene 2026"}
              </Badge>
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

      <SummarySection title="Conocimiento" icon={BrainCircuit}>
        <SummaryItem
          title="Explorar conocimiento"
          description="Consulta, exporta y borra lo que la IA aprendió de tus correos."
          icon={BrainCircuit}
          href={APP_ROUTES.app.intelligenceKnowledge}
          showChevron
          isLast
        />
      </SummarySection>

      {dashboard.role === "ADMIN" ? (
        <SummarySection title="Administración" icon={ShieldCheck}>
          <SummaryItem
            title="Administrar roles"
            description="Consulta y cambia los roles de Inteligencia."
            icon={ShieldCheck}
            href={APP_ROUTES.app.intelligenceAdminRoles}
            showChevron
          />
          <SummaryItem
            title="Cola de conocimiento"
            description="Revisa y revierte el conocimiento global."
            icon={BrainCircuit}
            href={APP_ROUTES.app.intelligenceAdminKnowledge}
            showChevron
            isLast
          />
        </SummarySection>
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
            {messagesRateLimitError ? (
              <Alert variant="warning" role="status">
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <AlertTitle>Demasiadas solicitudes a la lista</AlertTitle>
                <AlertDescription>
                  {messagesRetryInProgress
                    ? "La lista conserva los correos cargados. Reintentando sin recargar."
                    : "La lista conserva los correos cargados. El API limitó las solicitudes; se reintentará con una espera acotada o puedes reintentar ahora."}
                </AlertDescription>
                <AlertAction>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={retryMessagesNow}
                    disabled={messagesRetryInProgress}
                  >
                    <RefreshCw aria-hidden="true" /> Reintentar
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}
            {messagesQuery.isPending && messages.length === 0 ? (
              <div
                className="flex flex-col gap-2 p-2"
                aria-label="Cargando mensajes"
              >
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : messages.length === 0 &&
              messagesQuery.isError &&
              !messagesRateLimitError ? (
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
                <Button type="button" onClick={() => void refetchMessages()}>
                  <RefreshCw aria-hidden="true" /> Reintentar
                </Button>
              </Empty>
            ) : messages.length === 0 ? (
              messagesRateLimitError ? null : (
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
              )
            ) : (
              <>
                {hasPendingMessageUpdates ? (
                  <Alert variant="default" role="status">
                    <Mail className="size-4 shrink-0" aria-hidden="true" />
                    <AlertTitle>Hay correos nuevos</AlertTitle>
                    <AlertDescription>
                      La sincronización terminó. Actualiza la lista; se
                      recargará desde la primera página.
                    </AlertDescription>
                    <AlertAction>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void refreshMessages()}
                        disabled={messagesRetryInProgress}
                      >
                        <RefreshCw aria-hidden="true" /> Actualizar
                      </Button>
                    </AlertAction>
                  </Alert>
                ) : null}
                {messages.map((message) => (
                  <SummaryItem
                    key={message.id}
                    title={message.subject}
                    wrapTitle
                    description={`${message.fromAddress} · ${formatDateTime(message.receivedAt)}`}
                    icon={Mail}
                    onPress={() => setMessageSheetOpen(true, message.id)}
                    showChevron
                  />
                ))}
                <InfiniteListSentinel
                  hasNextPage={Boolean(hasNextPage) && !messagesQuery.error}
                  isFetchingNextPage={isFetchingNextPage}
                  onLoadMore={loadMore}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="review" className="flex flex-col gap-3">
            <ReviewSection
              enabled={connected}
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
        onOpenChange={handleMessageSheetOpenChange}
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

function useRetryClock(retryAt: number | undefined) {
  const [clock, setClock] = useState<{
    retryAt: number | undefined
    now: number | null
  }>({ retryAt: undefined, now: null })

  useEffect(() => {
    if (retryAt === undefined) {
      return
    }

    const update = () => setClock({ retryAt, now: Date.now() })
    const initialTimer = window.setTimeout(update, 0)
    const interval = window.setInterval(update, 1_000)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(interval)
    }
  }, [retryAt])

  if (retryAt === undefined) {
    return null
  }
  if (clock.retryAt !== retryAt) {
    return null
  }

  return clock.now
}

function formatRetryCountdown(retryAt: number, now: number | null) {
  if (now === null) {
    return "calculando la espera"
  }
  const remainingSeconds = Math.max(0, Math.ceil((retryAt - now) / 1_000))
  if (remainingSeconds === 0) {
    return "Reintento en curso"
  }
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  return `Reintento en ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function connectionSubtitle({
  emailAddress,
  requiresReconnect,
  oauthIncomplete,
  syncFailed,
  syncWaiting,
  syncing,
}: {
  emailAddress: string
  requiresReconnect: boolean
  oauthIncomplete: boolean
  syncFailed: boolean
  syncWaiting: boolean
  syncing: boolean
}) {
  if (oauthIncomplete) {
    return `${emailAddress} · Configuración OAuth incompleta`
  }
  if (requiresReconnect) {
    return `${emailAddress} · Reconecta Gmail`
  }
  if (syncFailed) {
    return `${emailAddress} · Última sincronización fallida`
  }
  if (syncWaiting) {
    return `${emailAddress} · Esperando reintento de Gmail`
  }
  if (syncing) {
    return `${emailAddress} · Importando desde 1 ene 2026`
  }
  return `${emailAddress} · Sin errores recientes`
}

function emailSocketStatusLabel(
  status: "connecting" | "connected" | "disconnected"
) {
  switch (status) {
    case "connected":
      return "Canal de actualizaciones en vivo. No indica la salud de Gmail."
    case "connecting":
      return "Conectando el canal de actualizaciones. No indica la salud de Gmail."
    default:
      return "Canal de actualizaciones sin conexión. No indica la salud de Gmail."
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
          ? `${data.fromAddress} · ${formatDateTime(data.receivedAt)} · #${shortMessageId(data.id)}`
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
          <SummarySection
            title="Cruda (retención limitada)"
            icon={FileText}
            collapsible
          >
            <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 font-sans text-sm wrap-break-word whitespace-pre-wrap">
              {data.content?.rawBody || "No disponible"}
            </pre>
          </SummarySection>
          <SummarySection
            title="Clasificación del mensaje"
            subtitle="Propuesta para revisión; no crea movimientos en Finanzas."
          >
            {data.provenance.observations
              .filter((item) => item.knowledgeType === "EMAIL_CLASSIFICATION")
              .map((item) => (
                <SummaryItem
                  key={`classification-${item.sequence}`}
                  title={`Ruta ${classificationRoute(item.payload)} · ${classificationType(item.payload)}`}
                  description={describeClassification(item.payload)}
                  icon={BrainCircuit}
                />
              ))}
            {!data.provenance.observations.some(
              (item) => item.knowledgeType === "EMAIL_CLASSIFICATION"
            ) ? (
              <p className="px-2 text-sm text-muted-foreground">
                Este mensaje aún no tiene una clasificación.
              </p>
            ) : null}
          </SummarySection>
          <EmailSignalSection message={data} />
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
                description={`${describeVerificationPayload(verification.correctedPayload)} · ${verification.verifierRole}${verification.isGroundTruth ? " · verdad de referencia HOLDOUT" : ""}${verification.notes ? ` · ${verification.notes}` : ""}`}
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

function classificationPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {}
  }
  return payload as Record<string, unknown>
}

function classificationRoute(payload: unknown): string {
  const value = classificationPayload(payload).route
  if (typeof value !== "string" || value === "NONE") {
    return "Sin dominio"
  }
  return value in ROUTE_LABELS
    ? ROUTE_LABELS[value as keyof typeof ROUTE_LABELS]
    : value
}

function classificationType(payload: unknown): string {
  const label = classificationPayload(payload).label
  if (!label || typeof label !== "object" || Array.isArray(label)) {
    return "sin tipo"
  }
  const value = (label as Record<string, unknown>).semanticType
  return typeof value === "string" && value in SEMANTIC_TYPE_LABELS
    ? SEMANTIC_TYPE_LABELS[value as keyof typeof SEMANTIC_TYPE_LABELS]
    : typeof value === "string"
      ? value
      : "sin tipo"
}

function describeClassification(payload: unknown): string {
  const value = classificationPayload(payload)
  const method =
    value.method === "KNOWLEDGE"
      ? "Conocimiento guardado"
      : value.method === "DETERMINISTIC"
        ? "Parser determinista"
        : value.method === "MODEL"
          ? "Modelo con validación"
          : "Método desconocido"
  const confidence =
    typeof value.confidence === "number"
      ? `confianza ${Math.round(value.confidence * 100)}%`
      : "confianza desconocida"
  const provider = typeof value.provider === "string" ? value.provider : null
  const model = typeof value.model === "string" ? value.model : null
  const label =
    value.label &&
    typeof value.label === "object" &&
    !Array.isArray(value.label)
      ? (value.label as Record<string, unknown>)
      : null
  const relevance =
    typeof label?.relevance === "boolean"
      ? label.relevance
        ? "relevante"
        : "no relevante"
      : null
  const transaction =
    label?.transaction &&
    typeof label.transaction === "object" &&
    !Array.isArray(label.transaction)
      ? Object.entries(label.transaction as Record<string, unknown>)
          .map(([key, item]) => `${key}: ${String(item)}`)
          .join(", ")
      : null
  const used = Array.isArray(value.knowledgeUsed)
    ? value.knowledgeUsed
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null
          }
          const entry = item as Record<string, unknown>
          return [entry.scope, entry.knowledgeType, entry.knowledgeKey]
            .filter((part) => typeof part === "string")
            .join(" ")
        })
        .filter(Boolean)
        .join(", ")
    : ""
  return [
    method,
    confidence,
    relevance,
    provider,
    model,
    transaction,
    used ? `conocimiento: ${used}` : "sin conocimiento aplicado",
  ]
    .filter(Boolean)
    .join(" · ")
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
      <pre className="rounded-lg bg-muted p-3 font-sans text-sm wrap-break-word whitespace-pre-wrap">
        {value || "No disponible"}
      </pre>
    </section>
  )
}
