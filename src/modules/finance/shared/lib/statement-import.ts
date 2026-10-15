import type {
  FinanceStatementImportLine,
  FinanceStatementLineDecision,
} from "@/src/modules/finance/shared/types/entities"

export type StatementLineGroups = {
  matched: FinanceStatementImportLine[]
  missing: FinanceStatementImportLine[]
  ignored: FinanceStatementImportLine[]
}

/** Splits the reconciliation lines by the decision the user left on each one. */
export function statementLineGroups(
  lines: readonly FinanceStatementImportLine[]
): StatementLineGroups {
  const matched: FinanceStatementImportLine[] = []
  const missing: FinanceStatementImportLine[] = []
  const ignored: FinanceStatementImportLine[] = []
  for (const line of lines) {
    if (line.decision === "MATCH") {
      matched.push(line)
      continue
    }
    if (line.decision === "CREATE") {
      missing.push(line)
    } else {
      ignored.push(line)
    }
  }
  return { matched, missing, ignored }
}

/**
 * Decision a line falls back to when the user re-checks it: an already matched
 * line goes back to MATCH, anything else is offered for creation.
 */
export function statementLineDefaultDecision(
  line: FinanceStatementImportLine
): FinanceStatementLineDecision {
  return line.transactionId === null ? "CREATE" : "MATCH"
}

/** Signed amount so debits read as negative in the reconciliation list. */
export function signedStatementLineAmount(
  line: Pick<FinanceStatementImportLine, "amount" | "type">
): number {
  const amount = Number(line.amount)
  return line.type === "DEBIT" ? -amount : amount
}
