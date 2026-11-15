import { buildInstitutionCard } from "@/src/modules/finance/products/lib/institution-card"
import type { InstitutionStackItem } from "@/src/modules/finance/shared/lib/institution-stack"
import type {
  EmailProductProposal,
  FinanceAccount,
  FinanceBalanceDrift,
  FinanceBalanceSheetLine,
  FinanceBudget,
  FinanceCard,
  FinanceCardStatementMovement,
  FinanceCategory,
  FinanceInstitution,
  FinanceLoan,
  FinanceMerchant,
  FinanceReceivable,
  FinanceReconciliationStatusItem,
  FinanceRecurringPattern,
  FinanceSavingsGoal,
  FinanceSubscription,
  FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { GALLERY_DISPLAY } from "@/src/modules/galleries/cards/mock/display"

/** Entidades falsas de la galería: sin API ni perfil del usuario.
 *
 * Category icons are escaped code points because the app stores category
 * glyphs as data, not decoration.
 */

const CREATED_AT = "2026-01-10T12:00:00.000Z"
const UPDATED_AT = "2026-10-20T12:00:00.000Z"

export const galleryInstitution: FinanceInstitution = {
  id: "inst-banco-ejemplo",
  name: "Banco Ejemplo",
  type: "bank",
  shortName: "Ejemplo",
  domain: "bancoejemplo.test",
  color: "#1D4ED8",
  logoUrl: null,
  country: "DO",
  isActive: true,
  isSystem: false,
}

export const galleryCashInstitution: FinanceInstitution = {
  id: "inst-efectivo",
  name: "Efectivo",
  type: "cash",
  color: "#334155",
  logoUrl: null,
  country: "DO",
  isActive: true,
  isSystem: true,
}

export const galleryCheckingAccount: FinanceAccount = {
  id: "acc-principal",
  institutionId: galleryInstitution.id,
  institutionName: galleryInstitution.name,
  institutionLogoUrl: null,
  name: "Cuenta principal",
  type: "CHECKING",
  currency: "DOP",
  accountNumberLast4: "4821",
  isDefaultForInstitution: true,
  balance: "125000.00",
  earmarkedAmount: "15000.00",
  freeBalance: "110000.00",
  color: "#1D4ED8",
  isActive: true,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
}

export const galleryNeutralAccount: FinanceAccount = {
  ...galleryCheckingAccount,
  id: "acc-ahorros",
  name: "Cuenta de ahorros",
  type: "SAVINGS",
  accountNumberLast4: "9034",
  balance: "48000.00",
  earmarkedAmount: "0.00",
  freeBalance: "48000.00",
  color: null,
  isDefaultForInstitution: false,
}

export const galleryLongNameAccount: FinanceAccount = {
  ...galleryNeutralAccount,
  id: "acc-nombre-largo",
  name: "Cuenta de ahorros para emergencias y viajes largos",
}

export const galleryUsdAccount: FinanceAccount = {
  ...galleryCheckingAccount,
  id: "acc-dolares",
  name: "Cuenta en dólares",
  type: "SAVINGS",
  currency: "USD",
  accountNumberLast4: "7710",
  balance: "2400.00",
  earmarkedAmount: "0.00",
  freeBalance: "2400.00",
  color: "#0F766E",
  isDefaultForInstitution: false,
}

export const galleryCashAccount: FinanceAccount = {
  ...galleryCheckingAccount,
  id: "acc-efectivo",
  institutionId: galleryCashInstitution.id,
  institutionName: galleryCashInstitution.name,
  name: "Efectivo",
  type: "CASH",
  accountNumberLast4: null,
  balance: "8500.00",
  earmarkedAmount: "0.00",
  freeBalance: "8500.00",
  color: null,
  isDefaultForInstitution: false,
}

export const galleryCreditCard: FinanceCard = {
  id: "card-credito",
  institutionId: galleryInstitution.id,
  institutionName: galleryInstitution.name,
  institutionLogoUrl: null,
  networkLogoUrl: null,
  accountId: galleryCheckingAccount.id,
  accountName: galleryCheckingAccount.name,
  name: "Tarjeta Ejemplo",
  type: "CREDIT",
  network: "VISA",
  lastFour: "4242",
  statementClosingDay: 28,
  paymentDueDay: 5,
  nextStatementDate: "2026-10-28",
  nextPaymentDueDate: "2026-11-05",
  color: "#0F766E",
  isActive: true,
  balances: [
    {
      id: "card-balance-dop",
      currency: "DOP",
      balance: "18000.00",
      creditLimit: "60000.00",
      availableCredit: "42000.00",
    },
  ],
}

export const galleryDebitCard: FinanceCard = {
  ...galleryCreditCard,
  id: "card-debito",
  name: "Tarjeta de débito",
  type: "DEBIT",
  network: "MASTERCARD",
  lastFour: "8899",
  statementClosingDay: null,
  paymentDueDay: null,
  nextStatementDate: null,
  nextPaymentDueDate: null,
  color: "#7C3AED",
  balances: [
    {
      id: "card-balance-debit",
      currency: "DOP",
      balance: "125000.00",
      creditLimit: null,
      availableCredit: null,
    },
  ],
}

export const galleryMultiCurrencyCard: FinanceCard = {
  ...galleryCreditCard,
  id: "card-multimoneda",
  name: "Tarjeta viajera",
  lastFour: "1188",
  color: null,
  balances: [
    {
      id: "card-balance-multi-dop",
      currency: "DOP",
      balance: "24000.00",
      creditLimit: "80000.00",
      availableCredit: "56000.00",
    },
    {
      id: "card-balance-multi-usd",
      currency: "USD",
      balance: "600.00",
      creditLimit: "2000.00",
      availableCredit: "1400.00",
    },
  ],
}

export const galleryLoan: FinanceLoan = {
  id: "loan-ejemplo",
  institutionId: galleryInstitution.id,
  institution: { id: galleryInstitution.id, name: galleryInstitution.name },
  accountId: galleryCheckingAccount.id,
  account: { id: galleryCheckingAccount.id, name: galleryCheckingAccount.name },
  disbursementAccountId: galleryCheckingAccount.id,
  disbursementAccount: {
    id: galleryCheckingAccount.id,
    name: galleryCheckingAccount.name,
  },
  name: "Préstamo Ejemplo",
  lenderName: "Banco Ejemplo",
  originalAmount: "300000.00",
  currentBalance: "185000.00",
  currency: "DOP",
  installmentAmount: "12500.00",
  installmentFreq: "MONTHLY",
  totalInstallments: 24,
  paidInstallments: 9,
  nextDueDate: "2026-11-05",
  interestRate: "0.18",
  rateType: "FIXED",
  insuranceAmount: "350.00",
  prepaymentPenaltyPct: "0.02",
  notes: null,
  isActive: true,
}

export const galleryPaidLoan: FinanceLoan = {
  ...galleryLoan,
  id: "loan-saldado",
  name: "Préstamo saldado",
  currentBalance: "0.00",
  paidInstallments: 24,
  nextDueDate: "2026-09-05",
  isActive: false,
}

export const galleryCategories: readonly FinanceCategory[] = [
  {
    id: "cat-super",
    name: "Súper",
    icon: "\u{1F6D2}",
    color: "#16A34A",
    parentId: null,
    isSystem: false,
    type: "EXPENSE",
    createdAt: CREATED_AT,
  },
  {
    id: "cat-cafe",
    name: "Café",
    icon: "\u{2615}",
    color: "#B45309",
    parentId: null,
    isSystem: false,
    type: "EXPENSE",
    createdAt: CREATED_AT,
  },
  {
    id: "cat-casa",
    name: "Casa",
    icon: "\u{1F3E0}",
    color: "#0EA5E9",
    parentId: null,
    isSystem: false,
    type: "EXPENSE",
    createdAt: CREATED_AT,
  },
  {
    id: "cat-luz",
    name: "Luz",
    icon: "\u{1F4A1}",
    color: "#F59E0B",
    parentId: "cat-casa",
    isSystem: false,
    type: "EXPENSE",
    createdAt: CREATED_AT,
  },
  {
    id: "cat-suscripciones",
    name: "Suscripciones",
    icon: "\u{1F501}",
    color: "#7C3AED",
    parentId: null,
    isSystem: false,
    type: "EXPENSE",
    createdAt: CREATED_AT,
  },
  {
    id: "cat-salario",
    name: "Salario",
    icon: "\u{1F4BC}",
    color: "#059669",
    parentId: null,
    isSystem: false,
    type: "INCOME",
    createdAt: CREATED_AT,
  },
]

export const gallerySuperCategory = galleryCategories[0]!
export const galleryHomeCategory = galleryCategories[2]!
export const galleryIncomeCategory = galleryCategories[5]!

export const galleryMerchant: FinanceMerchant = {
  id: "merchant-comercio-ejemplo",
  name: "Comercio Ejemplo",
  normalizedKey: "comercio ejemplo",
  aliases: ["Comercio Ej."],
  categoryId: gallerySuperCategory.id,
  logoUrl: null,
  createdAt: CREATED_AT,
  monthSpend: "3200.00",
  monthMovements: 7,
}

export const galleryMerchantWithoutCategory: FinanceMerchant = {
  ...galleryMerchant,
  id: "merchant-sin-categoria",
  name: "Comercio sin categoría",
  normalizedKey: "comercio sin categoria",
  aliases: [],
  categoryId: null,
  monthSpend: "750.00",
  monthMovements: 2,
}

export const galleryRecurringPattern: FinanceRecurringPattern = {
  id: "recurring-comercio",
  merchantId: galleryMerchant.id,
  merchant: galleryMerchant.name,
  merchantName: galleryMerchant.name,
  logoUrl: null,
  categoryId: gallerySuperCategory.id,
  avgAmount: "1250.00",
  currency: "DOP",
  frequency: 30,
  nextExpectedDate: "2026-11-15",
  lastSeenAt: "2026-10-15T12:00:00.000Z",
  status: "SUGGESTED",
  kind: "BILL",
  confidenceScore: 0.86,
  amountTolerancePct: 0.1,
  monthlyEquivalent: "1250.00",
  annualEquivalent: "15000.00",
  daysUntil: 23,
}

export const galleryAccountProposal: EmailProductProposal = {
  id: "proposal-cuenta",
  productType: "ACCOUNT",
  status: "PENDING",
  approvedProductId: null,
  matchedProductId: null,
  matchedProductIds: [],
  createdAt: CREATED_AT,
  evidence: [
    {
      messageId: "message-cuenta-2",
      fromDomain: "bancoejemplo.test",
      subject: "Tu cuenta de ahorros está lista",
      receivedAt: "2026-10-18T12:00:00.000Z",
      match: {},
      createdAt: "2026-10-18T12:00:00.000Z",
    },
    {
      messageId: "message-cuenta-1",
      fromDomain: "bancoejemplo.test",
      subject: "Bienvenido a tu cuenta de ahorros",
      receivedAt: "2026-10-12T12:00:00.000Z",
      match: {},
      createdAt: "2026-10-12T12:00:00.000Z",
    },
  ],
  draft: {
    productType: "ACCOUNT",
    name: "Ahorros Ejemplo",
    lastFour: "7788",
    currency: "DOP",
    accountType: "SAVINGS",
    cardType: null,
    network: null,
    accountId: null,
    institution: {
      name: galleryInstitution.name,
      type: "bank",
      domain: galleryInstitution.domain ?? null,
      country: "DO",
      matchedInstitutionId: null,
      matchedInstitutionIds: [],
    },
    accountNumberProvided: false,
  },
}

export const galleryCardProposal: EmailProductProposal = {
  id: "proposal-tarjeta",
  productType: "CARD",
  status: "PENDING",
  approvedProductId: null,
  matchedProductId: null,
  matchedProductIds: [],
  createdAt: CREATED_AT,
  evidence: [
    {
      messageId: "message-tarjeta-1",
      fromDomain: "bancoejemplo.test",
      subject: "Tu nueva tarjeta terminada en 4321",
      receivedAt: "2026-10-16T12:00:00.000Z",
      match: {},
      createdAt: "2026-10-16T12:00:00.000Z",
    },
  ],
  draft: {
    productType: "CARD",
    name: "Visa Ejemplo",
    lastFour: "4321",
    currency: "DOP",
    accountType: null,
    cardType: "CREDIT",
    network: "VISA",
    accountId: galleryCheckingAccount.id,
    institution: {
      name: galleryInstitution.name,
      type: "bank",
      domain: galleryInstitution.domain ?? null,
      country: "DO",
      matchedInstitutionId: null,
      matchedInstitutionIds: [],
    },
    accountNumberProvided: false,
  },
}

export const galleryApprovedProposal: EmailProductProposal = {
  ...galleryAccountProposal,
  id: "proposal-aprobada",
  status: "APPROVED",
  approvedProductId: galleryNeutralAccount.id,
  approval: {
    duplicate: false,
    productId: galleryNeutralAccount.id,
    reevaluatedSignals: 2,
  },
}

export const gallerySavingsGoal: FinanceSavingsGoal = {
  id: "goal-ejemplo",
  name: "Meta Ejemplo",
  description: "Fondo para imprevistos",
  targetAmount: "50000.00",
  currentAmount: "20000.00",
  currency: "DOP",
  targetDate: "2026-12-31",
  accountId: galleryCheckingAccount.id,
  mode: "EARMARK",
  spendReducesProgress: false,
  isCompleted: false,
  completedAt: null,
}

export const galleryCompletedGoal: FinanceSavingsGoal = {
  ...gallerySavingsGoal,
  id: "goal-superada",
  name: "Meta superada",
  currentAmount: "62000.00",
  isCompleted: true,
  completedAt: "2026-10-01T12:00:00.000Z",
}

export const galleryReceivable: FinanceReceivable = {
  id: "receivable-ejemplo",
  debtorName: "Deudor Ejemplo",
  description: "Préstamo personal",
  amount: "15000.00",
  paidAmount: "5000.00",
  creditBalance: "0.00",
  writtenOffAmount: "0.00",
  writtenOffAt: null,
  currency: "DOP",
  dueDate: "2026-11-15",
  status: "PARTIAL",
}

export const galleryBudget: FinanceBudget = {
  id: "budget-ejemplo",
  name: null,
  categoryId: gallerySuperCategory.id,
  category: {
    id: gallerySuperCategory.id,
    name: gallerySuperCategory.name,
    icon: gallerySuperCategory.icon,
    color: gallerySuperCategory.color,
  },
  categories: [
    {
      id: gallerySuperCategory.id,
      name: gallerySuperCategory.name,
      icon: gallerySuperCategory.icon,
      color: gallerySuperCategory.color,
    },
  ],
  includeChildren: false,
  rollover: "NONE",
  carriedOver: "0.00",
  effectiveLimit: "12000.00",
  recurring: true,
  periodType: "MONTHLY",
  periodStart: "2026-10-01",
  periodEnd: "2026-10-31",
  amountLimit: "12000.00",
  amountSpent: "7500.00",
  alertThresholdPct: 80,
}

export const galleryRiskyBudget: FinanceBudget = {
  ...galleryBudget,
  id: "budget-riesgo",
  amountSpent: "10200.00",
}

export const galleryExceededBudget: FinanceBudget = {
  ...galleryBudget,
  id: "budget-excedido",
  amountSpent: "14000.00",
}

const sharedSubscription = {
  normalizedKey: "suscripcion ejemplo",
  domain: "suscripcion-ejemplo.test",
  logoUrl: null,
  amount: "1499.00",
  currency: "DOP",
  billingCycle: "MONTHLY",
  billingInterval: 1,
  anchorDate: "2026-01-24",
  nextBillingDate: "2026-10-25",
  trialEndsAt: null,
  status: "ACTIVE",
  pausedAt: null,
  cancelledAt: null,
  reminderDaysBefore: 3,
  lastRemindedFor: null,
  lastChargeMismatch: false,
  lastPaymentAmount: null,
  cardId: galleryCreditCard.id,
  cardName: galleryCreditCard.name,
  accountId: null,
  accountName: null,
  categoryId: "cat-suscripciones",
  category: {
    id: "cat-suscripciones",
    name: "Suscripciones",
    icon: "\u{1F501}",
    color: "#7C3AED",
  },
  paymentMethod: {
    type: "CARD",
    id: galleryCreditCard.id,
    name: galleryCreditCard.name,
    institution: galleryInstitution.name,
    last4: galleryCreditCard.lastFour,
    logoUrl: null,
  },
  manageUrl: "https://suscripcion-ejemplo.test",
  notes: null,
  sourcePatternId: null,
  monthlyEquivalent: "1499.00",
  annualEquivalent: "17988.00",
  daysUntil: 2,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
} satisfies Omit<FinanceSubscription, "id" | "name">

export const gallerySubscription: FinanceSubscription = {
  ...sharedSubscription,
  id: "sub-ejemplo",
  name: "Suscripción Ejemplo",
  nextBillingDate: "2026-11-05",
  daysUntil: 13,
}

export const galleryWarningSubscription: FinanceSubscription = {
  ...sharedSubscription,
  id: "sub-aviso",
  name: "Suscripción con aviso",
  nextBillingDate: "2026-10-24",
  daysUntil: 1,
  lastChargeMismatch: true,
  lastPaymentAmount: "1799.00",
}

export const galleryPausedSubscription: FinanceSubscription = {
  ...sharedSubscription,
  id: "sub-pausada",
  name: "Suscripción pausada",
  status: "PAUSED",
  pausedAt: "2026-10-05T12:00:00.000Z",
  daysUntil: 2,
}

export const galleryOverdueSubscription: FinanceSubscription = {
  ...sharedSubscription,
  id: "sub-vencida",
  name: "Suscripción vencida",
  nextBillingDate: "2026-10-18",
  daysUntil: -5,
}

export const galleryTrialSubscription: FinanceSubscription = {
  ...sharedSubscription,
  id: "sub-gratis",
  name: "Suscripción en prueba",
  nextBillingDate: "2026-11-10",
  trialEndsAt: "2026-11-05",
  daysUntil: 18,
}

function galleryTransaction(
  input: Pick<FinanceTransaction, "id" | "type" | "amount"> &
    Partial<FinanceTransaction>
): FinanceTransaction {
  return {
    status: "CONFIRMED",
    editable: "FULL",
    currency: "DOP",
    ledgerAmount: input.amount,
    ledgerCurrency: "DOP",
    amountBaseCurrency: input.amount,
    exchangeRate: null,
    accountId: galleryCheckingAccount.id,
    accountName: galleryCheckingAccount.name,
    institutionLogoUrl: null,
    cardId: null,
    cardName: null,
    network: null,
    networkLogoUrl: null,
    categoryId: null,
    merchant: null,
    merchantId: null,
    merchantName: null,
    merchantLogoUrl: null,
    notes: null,
    source: null,
    transactionDate: "2026-10-20T15:30:00.000Z",
    description: null,
    transferGroupId: null,
    transferToAccountId: null,
    transferToAccountName: null,
    transferToCardId: null,
    transferToCardName: null,
    transferToAmount: null,
    transferToCurrency: null,
    transferEstimated: false,
    possibleDuplicateOfId: null,
    linkedTransactionId: null,
    aiMetadata: null,
    planningLink: null,
    ...input,
  }
}

export const galleryGroceryMovement: FinanceTransaction = galleryTransaction({
  id: "mv-super",
  type: "DEBIT",
  amount: "1250.00",
  categoryId: gallerySuperCategory.id,
  merchant: "Súper Ejemplo",
  merchantId: galleryMerchant.id,
  merchantName: "Súper Ejemplo",
  description: "Compra de la semana",
})

export const galleryIncomeMovement: FinanceTransaction = galleryTransaction({
  id: "mv-salario",
  type: "CREDIT",
  amount: "85000.00",
  categoryId: galleryIncomeCategory.id,
  merchant: "Salario Ejemplo",
  merchantName: "Salario Ejemplo",
  description: "Salario de octubre",
  transactionDate: "2026-10-01T13:00:00.000Z",
})

export const galleryTransferMovement: FinanceTransaction = galleryTransaction({
  id: "mv-transferencia",
  type: "TRANSFER",
  amount: "5900.00",
  transferGroupId: "transfer-ejemplo",
  transferToAccountId: galleryUsdAccount.id,
  transferToAccountName: galleryUsdAccount.name,
  transferToAmount: "100.00",
  transferToCurrency: "USD",
  exchangeRate: "0.016949",
  transferEstimated: true,
  description: "Compra de dólares",
})

export const galleryPendingMovement: FinanceTransaction = galleryTransaction({
  id: "mv-pendiente",
  type: "DEBIT",
  amount: "3200.00",
  status: "PENDING",
  categoryId: "cat-cafe",
  merchant: "Café Ejemplo",
  merchantName: "Café Ejemplo",
  description: "Cargo pendiente",
})

export const galleryReversedMovement: FinanceTransaction = galleryTransaction({
  id: "mv-revertido",
  type: "DEBIT",
  amount: "900.00",
  status: "REVERSED",
  linkedTransactionId: "mv-super",
  categoryId: gallerySuperCategory.id,
  merchant: "Comercio Ejemplo",
  merchantName: "Comercio Ejemplo",
  description: "Compra revertida",
})

export const galleryDuplicateMovement: FinanceTransaction = galleryTransaction({
  id: "mv-duplicado",
  type: "DEBIT",
  amount: "450.00",
  categoryId: "cat-cafe",
  merchant: "Café Ejemplo",
  merchantName: "Café Ejemplo",
  description: "Posible duplicado",
  possibleDuplicateOfId: "mv-pendiente",
})

export const galleryPartialMovement: FinanceTransaction = galleryTransaction({
  id: "mv-parcial",
  type: "DEBIT",
  amount: "1000.00",
  categoryId: gallerySuperCategory.id,
  merchant: "Comercio Ejemplo",
  merchantName: "Comercio Ejemplo",
  description: "Compra con reversa parcial",
})

export const galleryLargeMovement: FinanceTransaction = galleryTransaction({
  id: "mv-monto-grande",
  type: "DEBIT",
  amount: "1250000.00",
  categoryId: gallerySuperCategory.id,
  merchant: "Comercio Ejemplo",
  merchantName: "Comercio Ejemplo",
  description: "Compra de monto grande",
})

export const galleryStatementMovement: FinanceCardStatementMovement = {
  id: "stmt-mv-1",
  type: "DEBIT",
  status: "CONFIRMED",
  amount: "1250.00",
  currency: "DOP",
  ledgerAmount: "1250.00",
  ledgerCurrency: "DOP",
  transactionDate: "2026-10-20T15:30:00.000Z",
  merchant: "Súper Ejemplo",
  description: "Compra con tarjeta",
  transferGroupId: null,
}

export const galleryBalanceDrift: FinanceBalanceDrift = {
  id: "drift-cuenta",
  accountId: galleryCheckingAccount.id,
  cardId: null,
  currency: "DOP",
  name: galleryCheckingAccount.name,
  storedBalance: "125000.00",
  expectedBalance: "123750.00",
  difference: "1250.00",
  detectedAt: "2026-10-21T12:00:00.000Z",
  resolvedAt: null,
}

export const galleryReconciliationItem: FinanceReconciliationStatusItem = {
  key: "reconciliation-cuenta",
  kind: "account",
  accountId: galleryCheckingAccount.id,
  cardId: null,
  currency: "DOP",
  name: galleryCheckingAccount.name,
  institutionName: galleryInstitution.name,
  balance: "125000.00",
  reconciled: false,
  lastReconciledAt: "2026-09-30T12:00:00.000Z",
}

/** Institution models painted by `InstitutionWalletCard`. */
function institutionStackItem(
  irregularities: InstitutionStackItem["irregularities"]
): InstitutionStackItem {
  return {
    kind: "institution",
    id: galleryInstitution.id,
    institution: galleryInstitution,
    counts: { accounts: 2, cards: 1, loans: 1 },
    status: "COMPLETE",
    netWorth: "185000.00",
    totalAssets: "260000.00",
    totalLiabilities: "75000.00",
    issues: [],
    accounts: [galleryCheckingAccount, galleryNeutralAccount],
    cards: [galleryCreditCard],
    loans: [galleryLoan],
    cash: null,
    currencyTotals: [
      {
        currency: "DOP",
        assets: "260000.00",
        available: "260000.00",
        receivables: "0.00",
        liabilities: "75000.00",
        netWorth: "185000.00",
      },
    ],
    irregularities,
  }
}

function cashStackItem(
  irregularities: InstitutionStackItem["irregularities"]
): InstitutionStackItem {
  return {
    kind: "cash",
    id: galleryCashAccount.id,
    account: galleryCashAccount,
    balance: "8500.00",
    currencyTotals: [
      {
        currency: "DOP",
        assets: "8500.00",
        available: "8500.00",
        receivables: "0.00",
        liabilities: "0.00",
        netWorth: "8500.00",
      },
    ],
    irregularities,
  }
}

export const galleryInstitutionCard = buildInstitutionCard(
  institutionStackItem({ drift: false, reconciliation: false }),
  GALLERY_DISPLAY
)

export const galleryInstitutionWithDriftCard = buildInstitutionCard(
  institutionStackItem({ drift: true, reconciliation: true }),
  GALLERY_DISPLAY
)

export const galleryCashCard = buildInstitutionCard(
  cashStackItem({ drift: false, reconciliation: false }),
  GALLERY_DISPLAY
)

/** Lines of the net-worth breakdown for the wealth gallery (#285). */
function galleryWealthLine(
  input: Pick<FinanceBalanceSheetLine, "kind" | "id" | "name" | "entity"> &
    Partial<FinanceBalanceSheetLine>
): FinanceBalanceSheetLine {
  return {
    description: null,
    institutionId: null,
    currency: "DOP",
    balance: "0",
    balanceBase: "0",
    hasDrift: false,
    driftDifference: null,
    reconciliation: "RECONCILED",
    creditLimit: null,
    availableCredit: null,
    dueDate: null,
    doubtful: false,
    ...input,
  }
}

export const galleryAccountWealthLine = galleryWealthLine({
  kind: "ACCOUNT",
  id: galleryCheckingAccount.id,
  name: galleryCheckingAccount.name,
  institutionId: galleryCheckingAccount.institutionId,
  currency: galleryCheckingAccount.currency,
  balance: galleryCheckingAccount.balance,
  balanceBase: galleryCheckingAccount.balance,
  hasDrift: true,
  driftDifference: "125.00",
  reconciliation: "PENDING",
  entity: galleryCheckingAccount,
})

export const galleryCashWealthLine = galleryWealthLine({
  kind: "CASH",
  id: galleryCashAccount.id,
  name: galleryCashAccount.name,
  currency: galleryCashAccount.currency,
  balance: galleryCashAccount.balance,
  balanceBase: galleryCashAccount.balance,
  entity: galleryCashAccount,
})

export const galleryCardWealthLine = galleryWealthLine({
  kind: "CREDIT_CARD",
  id: galleryCreditCard.id,
  name: galleryCreditCard.name,
  institutionId: galleryCreditCard.institutionId,
  balance: "18000.00",
  balanceBase: "18000.00",
  creditLimit: "60000.00",
  availableCredit: "42000.00",
  reconciliation: "PENDING",
  entity: galleryCreditCard,
})

export const galleryLoanWealthLine = galleryWealthLine({
  kind: "LOAN",
  id: galleryLoan.id,
  name: galleryLoan.name ?? galleryLoan.lenderName,
  institutionId: galleryLoan.institutionId,
  currency: galleryLoan.currency,
  balance: galleryLoan.currentBalance,
  balanceBase: galleryLoan.currentBalance,
  entity: galleryLoan,
})

export const galleryReceivableWealthLine = galleryWealthLine({
  kind: "RECEIVABLE",
  id: galleryReceivable.id,
  name: galleryReceivable.debtorName,
  currency: galleryReceivable.currency,
  balance: "10000.00",
  balanceBase: "10000.00",
  dueDate: galleryReceivable.dueDate,
  entity: galleryReceivable,
})

export const galleryDoubtfulReceivableWealthLine = galleryWealthLine({
  kind: "RECEIVABLE",
  id: "receivable-dudoso",
  name: "Deudor dudoso",
  currency: "DOP",
  balance: "4000.00",
  balanceBase: "4000.00",
  dueDate: "2026-06-15",
  doubtful: true,
  entity: galleryReceivable,
})
