import type { AccountFormValues } from "@/src/modules/finance/catalog/lib/account-form"

/** Lo que identifica una sesión de edición: la hoja abierta y la cuenta. */
export type AccountFormSession = {
  open: boolean
  accountId: string | null
}

export type AccountFormResetPlan = {
  /** Sesión ya aplicada, para la siguiente comprobación. */
  appliedSession: string | null
  /** Valores con los que reiniciar, o `null` para dejar el formulario tal cual. */
  values: AccountFormValues | null
}

export type AccountFormResetInput = {
  session: AccountFormSession
  appliedSession: string | null
  initialValues: AccountFormValues
}

const NEW_ACCOUNT_SESSION = "new-account"

/**
 * El formulario empieza limpio al abrir la hoja o al cambiar la cuenta editada.
 * Cambiar de institución no lo reinicia: el usuario puede haber escrito nombre,
 * tipo, últimos 4, saldo o color, y solo se sincroniza `institutionId`.
 */
export function resolveAccountFormReset({
  session,
  appliedSession,
  initialValues,
}: AccountFormResetInput): AccountFormResetPlan {
  if (!session.open) {
    return { appliedSession: null, values: null }
  }
  const sessionKey = session.accountId ?? NEW_ACCOUNT_SESSION
  if (appliedSession === sessionKey) {
    return { appliedSession, values: null }
  }
  return { appliedSession: sessionKey, values: initialValues }
}
