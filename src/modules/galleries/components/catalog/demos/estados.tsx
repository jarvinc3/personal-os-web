import { PlusIcon, SearchXIcon, WalletIcon } from "lucide-react"

import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import { IconBadge } from "@/src/shared/components/data-display/icon-badge"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import {
  CardSkeleton,
  ListSkeleton,
} from "@/src/shared/components/feedback/list-skeleton"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { ModuleComingSoon } from "@/src/shared/components/feedback/module-coming-soon"
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

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

export const estadosDemos: GalleryDemoMap = {
  "icon-badge": [
    {
      label: "Tonos, color de entidad y contenido propio",
      code: `
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
`,
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
      code: `
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
  <Empty className={cn(EMPTY_COMPACT_CLASS_NAME, "border")}>
    <EmptyHeader>
      <EmptyTitle>Ningún país coincide</EmptyTitle>
    </EmptyHeader>
  </Empty>
</div>
`,
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
      code: `
<div className="flex w-full flex-col gap-2">
  <Skeleton className="h-4 w-32" />
  <Skeleton className="h-20 w-full rounded-2xl" />
</div>
`,
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
      code: `
<div className="w-full rounded-2xl border border-border">
  <ListSkeleton rows={3} />
</div>
`,
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
      code: `
<div className="flex w-full flex-col gap-3">
  <CardSkeleton height={16} />
  <CardSkeleton height={28} />
  <CardSkeleton height={40} />
</div>
`,
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
      code: `
<div className="w-full rounded-2xl border border-border">
  <LoadingView variant="inline" />
</div>
`,
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
      code: `
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
`,
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
      code: `
<Button disabled size="sm">
  <Spinner />
  Cargando
</Button>
`,
      node: (
        <Button disabled size="sm">
          <Spinner />
          Cargando
        </Button>
      ),
    },
  ],
  "module-coming-soon": [
    {
      label: "App activa sin sus pantallas",
      code: `
<ModuleComingSoon slug="agenda" />
`,
      node: <ModuleComingSoon slug="agenda" />,
    },
  ],
}

export const estadosVariantDemos: GalleryVariantDemoMap = {
  "icon-badge": {
    tone: [
      {
        label: "primary",
        node: <IconBadge icon={WalletIcon} tone="primary" />,
      },
      {
        label: "success",
        node: <IconBadge icon={WalletIcon} tone="success" />,
      },
      {
        label: "warning",
        node: <IconBadge icon={WalletIcon} tone="warning" />,
      },
      { label: "info", node: <IconBadge icon={WalletIcon} tone="info" /> },
      {
        label: "destructive",
        node: <IconBadge icon={WalletIcon} tone="destructive" />,
      },
      { label: "muted", node: <IconBadge icon={WalletIcon} tone="muted" /> },
    ],
    color: [
      {
        label: "acento de una entidad o categoría",
        node: <IconBadge icon={WalletIcon} color="#0f766e" />,
      },
    ],
    size: [
      {
        label: "48",
        node: <IconBadge icon={WalletIcon} tone="primary" size={48} />,
      },
      {
        label: "32",
        node: <IconBadge icon={WalletIcon} tone="primary" size={32} />,
      },
    ],
  },
  empty: {
    "variant (EmptyMedia)": [
      {
        label: "default",
        node: (
          <Empty className="w-full max-w-sm border p-6">
            <EmptyHeader>
              <EmptyMedia>
                <WalletIcon />
              </EmptyMedia>
              <EmptyTitle>Sin cuentas todavía</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ),
      },
      {
        label: "icon",
        node: (
          <Empty className="w-full max-w-sm border p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WalletIcon />
              </EmptyMedia>
              <EmptyTitle>Sin cuentas todavía</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ),
      },
    ],
    size: [
      {
        label: "normal",
        node: (
          <Empty className="w-full max-w-sm border p-6">
            <EmptyHeader>
              <EmptyTitle>Sin resultados</EmptyTitle>
              <EmptyDescription>
                Prueba con otro nombre o con un monto menor.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ),
      },
      {
        label: "compacta con EMPTY_COMPACT_CLASS_NAME",
        node: (
          <Empty
            className={`${EMPTY_COMPACT_CLASS_NAME} w-full max-w-sm border`}
          >
            <EmptyHeader>
              <EmptyTitle>Ningún país coincide</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ),
      },
    ],
  },
  skeleton: {
    className: [
      {
        label: "línea",
        node: <Skeleton className="h-4 w-32" />,
      },
      {
        label: "bloque",
        node: <Skeleton className="h-20 w-full max-w-sm rounded-2xl" />,
      },
      {
        label: "círculo",
        node: <Skeleton className="size-10 rounded-full" />,
      },
    ],
  },
  "list-skeleton": {
    rows: [
      {
        label: "3",
        node: (
          <div className="w-full max-w-sm rounded-2xl border border-border">
            <ListSkeleton rows={3} />
          </div>
        ),
      },
      {
        label: "5",
        node: (
          <div className="w-full max-w-sm rounded-2xl border border-border">
            <ListSkeleton rows={5} />
          </div>
        ),
      },
    ],
  },
  "card-skeleton": {
    height: [
      { label: "16", node: <CardSkeleton height={16} /> },
      { label: "28", node: <CardSkeleton height={28} /> },
      { label: "40", node: <CardSkeleton height={40} /> },
    ],
  },
  "loading-view": {
    variant: [
      {
        label: "screen",
        node: (
          <div className="h-[70vh] w-full max-w-sm overflow-hidden rounded-2xl border border-border">
            <LoadingView variant="screen" />
          </div>
        ),
      },
      {
        label: "inline",
        node: (
          <div className="w-full max-w-sm rounded-2xl border border-border">
            <LoadingView variant="inline" />
          </div>
        ),
      },
    ],
  },
  "error-state": {
    states: [
      {
        label: "error",
        node: (
          <div className="w-full max-w-sm rounded-2xl border border-border">
            <ErrorState
              message="El servidor no respondió."
              onRetry={() => simulatedTap("Reintentar")}
            />
          </div>
        ),
      },
      {
        label: "reintentando",
        node: (
          <div className="w-full max-w-sm rounded-2xl border border-border">
            <ErrorState
              message="El servidor no respondió."
              onRetry={() => simulatedTap("Reintentar")}
              isRetrying
            />
          </div>
        ),
      },
    ],
  },
  spinner: {
    className: [
      {
        label: "en un botón",
        node: (
          <Button disabled size="sm">
            <Spinner />
            Cargando
          </Button>
        ),
      },
      {
        label: "tamaño y color del contexto",
        node: <Spinner className="size-6 text-primary" />,
      },
    ],
  },
  "module-coming-soon": {
    slug: [
      { label: "agenda", node: <ModuleComingSoon slug="agenda" /> },
      { label: "health", node: <ModuleComingSoon slug="health" /> },
    ],
  },
}
