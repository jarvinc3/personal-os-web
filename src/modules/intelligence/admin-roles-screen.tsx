"use client"

import { useAiRoles } from "@/src/modules/intelligence/hooks/use-ai-roles"
import { ROLE_LABELS, roleChange } from "@/src/modules/intelligence/role-change"
import type {
  AiRole,
  AiRoleRow,
} from "@/src/modules/intelligence/types/intelligence.types"
import { Button } from "@/src/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Spinner } from "@/src/shared/components/ui/spinner"
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
import {
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XIcon,
} from "lucide-react"
import { useState } from "react"

type RoleChangeRequest = {
  account: AiRoleRow
  role: AiRole
}

function accountName(account: AiRoleRow): string {
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
              title={accountName(account)}
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
        <p className="px-2 text-xs leading-relaxed text-muted-foreground">
          Colaborador no agrega permisos sobre Usuario: el aporte al
          conocimiento global lo decide el consentimiento de cada cuenta en
          Privacidad y datos.
        </p>
      </SummarySection>

      <AlertDialog
        open={request !== null}
        onOpenChange={(open) => {
          if (!open && !updateRoleMutation.isPending) {
            setRequest(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-muted text-muted-foreground">
              <ShieldCheck aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              ¿Cambiar a {request ? ROLE_LABELS[request.role] : ""} la cuenta de{" "}
              {request ? accountName(request.account) : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              El cambio se aplica de inmediato. Cancelar deja el rol como está.
            </AlertDialogDescription>
          </AlertDialogHeader>
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
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateRoleMutation.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <Button
              disabled={updateRoleMutation.isPending}
              onClick={() => {
                if (!request) {
                  return
                }
                updateRoleMutation.mutate(
                  { userId: request.account.id, role: request.role },
                  { onSettled: () => setRequest(null) }
                )
              }}
            >
              {updateRoleMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
              )}
              {updateRoleMutation.isPending ? "Cambiando..." : "Cambiar rol"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
