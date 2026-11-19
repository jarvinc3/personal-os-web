import { PlusIcon, SearchXIcon, WalletIcon } from "lucide-react"

import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import { IconBadge } from "@/src/shared/components/data-display/icon-badge"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import {
  CardSkeleton,
  ListSkeleton,
} from "@/src/shared/components/feedback/list-skeleton"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  EMPTY_COMPACT_CLASS_NAME,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Spinner } from "@/src/shared/components/ui/spinner"

import type { GalleryDemoMap } from "@/src/modules/galleries/components/catalog/types"

export const estadosDemos: GalleryDemoMap = {
  "icon-badge": [
    {
      label: "Tonos, color de entidad y contenido propio",
      node: (
        <div className="flex flex-wrap items-center gap-3">
          <IconBadge icon={WalletIcon} tone="primary" />
          <IconBadge icon={WalletIcon} tone="success" size={40} />
          <IconBadge icon={WalletIcon} tone="warning" size={32} />
          <IconBadge icon={WalletIcon} color="#0f766e" />
          <IconBadge size={40}>
            <span className="text-sm font-semibold" aria-hidden>
              AB
            </span>
          </IconBadge>
        </div>
      ),
    },
  ],
  empty: [
    {
      label: "Con acción, sin resultados y compacta",
      node: (
        <div className="flex w-full flex-col gap-3">
          <Empty className="border p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WalletIcon />
              </EmptyMedia>
              <EmptyTitle>Sin cuentas todavía</EmptyTitle>
              <EmptyDescription>
                Agrega una cuenta para ver su saldo y sus movimientos.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" onClick={() => simulatedTap("Agregar cuenta")}>
                <PlusIcon />
                Agregar cuenta
              </Button>
            </EmptyContent>
          </Empty>
          <Empty className="border p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchXIcon />
              </EmptyMedia>
              <EmptyTitle>La búsqueda no encontró nada</EmptyTitle>
              <EmptyDescription>
                Prueba con otro nombre o con un monto menor.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          <Empty className={`${EMPTY_COMPACT_CLASS_NAME} border`}>
            <EmptyHeader>
              <EmptyTitle>Ningún país coincide</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </div>
      ),
    },
  ],
  skeleton: [
    {
      label: "Línea y bloque",
      node: (
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ),
    },
  ],
  "list-skeleton": [
    {
      label: "Tres filas",
      node: (
        <div className="w-full rounded-2xl border border-border">
          <ListSkeleton rows={3} />
        </div>
      ),
    },
  ],
  "card-skeleton": [
    {
      label: "Alturas 16, 28 y 40",
      node: (
        <div className="flex w-full flex-col gap-3">
          <CardSkeleton height={16} />
          <CardSkeleton height={28} />
          <CardSkeleton height={40} />
        </div>
      ),
    },
  ],
  "loading-view": [
    {
      label: "Inline",
      node: (
        <div className="w-full rounded-2xl border border-border">
          <LoadingView variant="inline" />
        </div>
      ),
    },
  ],
  "error-state": [
    {
      label: "Con Reintentar y reintentando",
      node: (
        <div className="flex w-full flex-col gap-3">
          <div className="rounded-2xl border border-border">
            <ErrorState
              message="El servidor no respondió."
              onRetry={() => simulatedTap("Reintentar")}
            />
          </div>
          <div className="rounded-2xl border border-border">
            <ErrorState
              message="El servidor no respondió."
              onRetry={() => simulatedTap("Reintentar")}
              isRetrying
            />
          </div>
        </div>
      ),
    },
  ],
  spinner: [
    {
      label: "Dentro de un botón",
      node: (
        <Button disabled size="sm">
          <Spinner />
          Cargando
        </Button>
      ),
    },
  ],
}
