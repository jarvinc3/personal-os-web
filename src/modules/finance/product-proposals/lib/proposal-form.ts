import { z } from "zod"

import {
  FINANCE_CARD_NETWORKS,
  type FinanceCardNetwork,
} from "@/src/modules/finance/shared/constants/catalog"
import {
  EMAIL_PRODUCT_PROPOSAL_ACCOUNT_TYPES,
  EMAIL_PRODUCT_PROPOSAL_CARD_TYPES,
  EMAIL_PRODUCT_PROPOSAL_INSTITUTION_TYPES,
  type EmailProductProposal,
  type EmailProductProposalAccountType,
  type EmailProductProposalCardType,
  type EmailProductProposalInstitutionType,
  type UpdateEmailProductProposalBody,
} from "@/src/modules/finance/shared/types/entities"

const ACCOUNT_NUMBER_PATTERN = /^[0-9\s-]{4,48}$/
const CURRENCY_PATTERN = /^[A-Za-z]{3}$/
const LAST_FOUR_PATTERN = /^\d{4}$/
const MIN_ACCOUNT_NUMBER_DIGITS = 4
const MAX_ACCOUNT_NUMBER_DIGITS = 34

/** El back no acepta `network` nulo al editar: sin red detectada se propone «Otra». */
export const DEFAULT_PROPOSAL_NETWORK: FinanceCardNetwork = "OTHER"

export type ProposalFormValues = {
  name: string
  type: string
  currency: string
  lastFour: string
  network: FinanceCardNetwork
  accountId: string | null
  accountNumber: string
  institutionName: string
  institutionType: EmailProductProposalInstitutionType
  institutionCountry: string
  institutionDomain: string
}

export function isProposalAccountType(
  value: string
): value is EmailProductProposalAccountType {
  return EMAIL_PRODUCT_PROPOSAL_ACCOUNT_TYPES.some((type) => type === value)
}

export function isProposalCardType(
  value: string
): value is EmailProductProposalCardType {
  return EMAIL_PRODUCT_PROPOSAL_CARD_TYPES.some((type) => type === value)
}

/** Un tipo que el contrato no lista se edita como «Otro», no se rechaza en seco. */
export function proposalInstitutionType(
  value: string
): EmailProductProposalInstitutionType {
  return (
    EMAIL_PRODUCT_PROPOSAL_INSTITUTION_TYPES.find((type) => type === value) ??
    "other"
  )
}

export function toProposalFormValues(
  proposal: EmailProductProposal
): ProposalFormValues {
  const draft = proposal.draft
  const type =
    proposal.productType === "ACCOUNT"
      ? (draft.accountType ?? "CHECKING")
      : (draft.cardType ?? "CREDIT")
  return {
    name: draft.name,
    type,
    currency: draft.currency,
    lastFour: draft.lastFour,
    network: draft.network ?? DEFAULT_PROPOSAL_NETWORK,
    accountId: draft.accountId,
    accountNumber: "",
    institutionName: draft.institution.name,
    institutionType: proposalInstitutionType(draft.institution.type),
    institutionCountry: draft.institution.country.trim().toUpperCase(),
    institutionDomain: draft.institution.domain ?? "",
  }
}

const baseProposalFormSchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  type: z.string().trim().min(1, "Elige el tipo"),
  currency: z.string().trim(),
  lastFour: z.string().trim().regex(LAST_FOUR_PATTERN, "Deben ser 4 dígitos"),
  network: z.enum(FINANCE_CARD_NETWORKS),
  accountId: z.string().nullable(),
  accountNumber: z.string().trim(),
  institutionName: z.string().trim().min(1, "Institución obligatoria").max(120),
  institutionType: z.enum(EMAIL_PRODUCT_PROPOSAL_INSTITUTION_TYPES),
  institutionCountry: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Código de país de 2 letras"),
  institutionDomain: z.string().trim().max(253),
})

type ProposalFormCtx = z.RefinementCtx
type ProposalFormInput = z.infer<typeof baseProposalFormSchema>

/**
 * La cuenta solo lleva campos de cuenta y la tarjeta solo los de tarjeta: el
 * back rechaza los del otro tipo. La validación de un tipo no mira los campos
 * del otro, aunque el formulario los tenga ocultos.
 */
function addAccountIssues({
  values,
  proposal,
  ctx,
}: {
  values: ProposalFormInput
  proposal: EmailProductProposal
  ctx: ProposalFormCtx
}) {
  if (!isProposalAccountType(values.type)) {
    ctx.addIssue({
      code: "custom",
      path: ["type"],
      message: "Elige el tipo de cuenta",
    })
  }
  if (!CURRENCY_PATTERN.test(values.currency)) {
    ctx.addIssue({
      code: "custom",
      path: ["currency"],
      message: "Moneda de 3 letras",
    })
  }
  if (!values.accountNumber) {
    addStoredNumberIssue({ values, proposal, ctx })
    return
  }
  const digits = values.accountNumber.replace(/\D/g, "")
  if (
    !ACCOUNT_NUMBER_PATTERN.test(values.accountNumber) ||
    digits.length < MIN_ACCOUNT_NUMBER_DIGITS ||
    digits.length > MAX_ACCOUNT_NUMBER_DIGITS
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["accountNumber"],
      message: "Número de 4 a 34 dígitos",
    })
    return
  }
  if (!digits.endsWith(values.lastFour)) {
    ctx.addIssue({
      code: "custom",
      path: ["accountNumber"],
      message: "El número no termina en esos 4 dígitos",
    })
  }
}

/**
 * Con un número completo guardado, el back rechaza cambiar los últimos 4 sin
 * mandar el número otra vez. Se avisa en el formulario y no en un 400.
 */
function addStoredNumberIssue({
  values,
  proposal,
  ctx,
}: {
  values: ProposalFormInput
  proposal: EmailProductProposal
  ctx: ProposalFormCtx
}) {
  if (!proposal.draft.accountNumberProvided) {
    return
  }
  if (values.lastFour === proposal.draft.lastFour) {
    return
  }
  ctx.addIssue({
    code: "custom",
    path: ["accountNumber"],
    message: "Escribe el número completo: cambiaste los últimos 4",
  })
}

function addCardIssues({
  values,
  ctx,
}: {
  values: ProposalFormInput
  ctx: ProposalFormCtx
}) {
  if (!isProposalCardType(values.type)) {
    ctx.addIssue({
      code: "custom",
      path: ["type"],
      message: "Elige el tipo de tarjeta",
    })
  }
}

export function proposalFormSchemaFor(proposal: EmailProductProposal) {
  return baseProposalFormSchema.superRefine((values, ctx) => {
    if (proposal.productType === "ACCOUNT") {
      addAccountIssues({ values, proposal, ctx })
      return
    }
    addCardIssues({ values, ctx })
  })
}

/**
 * Cuerpo del PATCH con solo los campos del tipo de producto. El formulario ya
 * pasó por `proposalFormSchemaFor`, así que aquí no se repiten sus reglas.
 */
export function buildProposalPatch({
  proposal,
  values,
}: {
  proposal: EmailProductProposal
  values: ProposalFormValues
}): UpdateEmailProductProposalBody {
  const institution = {
    institutionName: values.institutionName,
    institutionType: values.institutionType,
    institutionDomain: values.institutionDomain || null,
    institutionCountry: values.institutionCountry.toUpperCase(),
  }
  if (proposal.productType === "ACCOUNT") {
    if (!isProposalAccountType(values.type)) {
      throw new Error(`Tipo de cuenta inesperado: ${values.type}`)
    }
    const body: UpdateEmailProductProposalBody = {
      name: values.name,
      lastFour: values.lastFour,
      accountType: values.type,
      currency: values.currency.toUpperCase(),
      ...institution,
    }
    if (values.accountNumber) {
      body.accountNumber = values.accountNumber
    }
    return body
  }
  if (!isProposalCardType(values.type)) {
    throw new Error(`Tipo de tarjeta inesperado: ${values.type}`)
  }
  const body: UpdateEmailProductProposalBody = {
    name: values.name,
    lastFour: values.lastFour,
    cardType: values.type,
    accountId: values.accountId,
    ...institution,
  }
  // Sin red detectada, el formulario propone «Otra»: solo se manda si cambió.
  if (values.network !== proposal.draft.network) {
    body.network = values.network
  }
  return body
}
