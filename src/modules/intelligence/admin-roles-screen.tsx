"use client"

import { useAiRoles } from "@/src/modules/intelligence/hooks/use-ai-roles"
import type { AiRole } from "@/src/modules/intelligence/types/intelligence.types"
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
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { AlertCircle, RefreshCw, ShieldCheck, UserRound } from "lucide-react"

const ROLE_LABELS: Record<AiRole, string> = {
  USER: "Usuario",
  CONTRIBUTOR: "Colaborador",
  ADMIN: "Administrador",
}

export function AdminRolesScreen() {
  const { rolesQuery, updateRoleMutation } = useAiRoles()
  usePageHeader({ title: "Roles de Inteligencia" })

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-10 md:px-6">
      <SummarySection
        title="Acceso y contribución"
        subtitle="Los cambios se aplican de inmediato."
        icon={ShieldCheck}
      >
        {rolesQuery.isPending ? (
          <div className="flex flex-col gap-2 p-2" aria-label="Cargando roles">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : rolesQuery.isError ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No se pudieron cargar los roles</EmptyTitle>
              <EmptyDescription>
                Verifica tu acceso de administrador e inténtalo otra vez.
              </EmptyDescription>
            </EmptyHeader>
            <Button type="button" onClick={() => void rolesQuery.refetch()}>
              <RefreshCw aria-hidden="true" /> Reintentar
            </Button>
          </Empty>
        ) : !rolesQuery.data?.length ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserRound aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No hay cuentas para mostrar</EmptyTitle>
              <EmptyDescription>Los usuarios aparecerán aquí.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          rolesQuery.data.map((account, index) => (
            <SummaryItem
              key={account.id}
              title={account.fullName || account.email}
              description={`${account.email} · ${ROLE_LABELS[account.role]}`}
              icon={UserRound}
              isLast={index === rolesQuery.data!.length - 1}
              trailing={
                <div className="flex flex-col items-end gap-1">
                  <label className="sr-only" htmlFor={`role-${account.id}`}>
                    Rol para {account.email}
                  </label>
                  <select
                    id={`role-${account.id}`}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={account.role}
                    disabled={updateRoleMutation.isPending}
                    onChange={(event) =>
                      updateRoleMutation.mutate({
                        userId: account.id,
                        role: event.target.value as AiRole,
                      })
                    }
                  >
                    {(Object.keys(ROLE_LABELS) as AiRole[]).map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </div>
              }
              className="pr-3"
            />
          ))
        )}
      </SummarySection>
    </main>
  )
}
