"use client"

import { useAiRoles } from "@/src/modules/intelligence/hooks/use-ai-roles"
import { ROLE_LABELS, roleChange } from "@/src/modules/intelligence/role-change"
import type {
  AiRole,
  AiRoleRow,
} from "@/src/modules/intelligence/types/intelligence.types"
import { Button } from "@/src/shared/components/ui/button"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { AlertCircle, RefreshCw, ShieldCheck, UserRound } from "lucide-react"
import { useState } from "react"

type RoleChangeRequest = {
  account: AiRoleRow
  role: AiRole
}

function accountName({ account }: { account: AiRoleRow }): string {
  return account.fullName || account.email
}

export function AdminRolesScreen() {
  const { rolesQuery, updateRoleMutation } = useAiRoles()
  const [request, setRequest] = useState<RoleChangeRequest | null>(null)
  usePageHeader({ title: "Roles de Inteligencia" })
  const change = request
    ? roleChange({ currentRole: request.account.role, nextRole: request.role })
    : null

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-10 md:px-6">
      <SummarySection
        title="Acceso y contribución"
        subtitle="Cada cambio explica qué gana o pierde la cuenta antes de aplicarse."
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
              title={accountName({ account })}
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
                    value={
                      request?.account.id === account.id
                        ? request.role
                        : account.role
                    }
                    disabled={updateRoleMutation.isPending}
                    onChange={(event) => {
                      const role = event.target.value as AiRole
                      if (role === account.role) {
                        return
                      }
                      setRequest({ account, role })
                    }}
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

      <ConfirmDialog
        open={request !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRequest(null)
          }
        }}
        icon={ShieldCheck}
        wide
        title={`¿Cambiar a ${request ? ROLE_LABELS[request.role] : ""} la cuenta de ${request ? accountName(request) : ""}?`}
        description="El cambio se aplica de inmediato. Cancelar deja el rol como está."
        confirmLabel="Cambiar rol"
        confirmIcon={ShieldCheck}
        pending={updateRoleMutation.isPending}
        pendingLabel="Cambiando..."
        onConfirm={() => {
          if (!request) {
            return
          }
          updateRoleMutation.mutate(
            { userId: request.account.id, role: request.role },
            { onSuccess: () => setRequest(null) }
          )
        }}
      >
        {change && change.gains.length === 0 && change.loses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            El rol no cambia lo que la cuenta puede hacer.
          </p>
        ) : null}
        {change && change.gains.length > 0 ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">Podrá:</p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
              {change.gains.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {change && change.loses.length > 0 ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">
              Dejará de poder:
            </p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
              {change.loses.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </ConfirmDialog>
    </main>
  )
}
