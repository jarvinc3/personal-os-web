# Finance Money Format Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present every read-only finance amount as `<ISO> <currency symbol><amount>`, such as `DOP $78,224.48`, `USD $510`, and `EUR €1,000`.

**Architecture:** Keep `formatFinanceMoney` as the single formatting boundary and make its output deterministic with an `en-US` numeric locale plus the ISO code and `Intl` narrow currency symbol. Route the few raw amount presentations through that helper while preserving numeric-only form controls and each amount's own currency.

**Tech Stack:** TypeScript 5.9, React 19, Next.js 16, Node test runner, `Intl.NumberFormat`, ESLint.

## Global Constraints

- Do not change API contracts or values sent to the backend.
- Do not add dependencies.
- Do not format editable input values.
- Preserve existing `showCents` and `compactNumbers` preferences.
- Preserve pre-existing local changes and do not include them in implementation commits.
- Invalid amounts or currency codes render as `—`.

---

### Task 1: Deterministic ISO and symbol formatting

**Files:**
- Modify: `src/modules/finance/lib/money.spec.ts`
- Modify: `src/modules/finance/lib/money.ts`

**Interfaces:**
- Consumes: `FinanceMoneyDisplay { currency: string; showCents: boolean; compactNumbers: boolean }`.
- Produces: `formatFinanceMoney(value, display): string` with the exact `<ISO> <symbol><amount>` contract.

- [ ] **Step 1: Replace the loose formatter assertion with failing contract tests**

```ts
describe("formatFinanceMoney", () => {
  it("formats DOP with its ISO code and dollar symbol", () => {
    assert.equal(
      formatFinanceMoney("78224.48", {
        currency: "DOP",
        showCents: true,
        compactNumbers: false,
      }),
      "DOP $78,224.48",
    )
  })

  it("normalizes USD and omits cents when configured", () => {
    assert.equal(
      formatFinanceMoney("510", {
        currency: "usd",
        showCents: false,
        compactNumbers: false,
      }),
      "USD $510",
    )
  })

  it("uses the real narrow symbol for non-dollar currencies", () => {
    assert.equal(
      formatFinanceMoney("1000", {
        currency: "EUR",
        showCents: false,
        compactNumbers: false,
      }),
      "EUR €1,000",
    )
  })

  it("keeps compact number preferences", () => {
    assert.equal(
      formatFinanceMoney("1200", {
        currency: "DOP",
        showCents: false,
        compactNumbers: true,
      }),
      "DOP $1K",
    )
  })

  it("returns an em dash for invalid amounts or currencies", () => {
    const display = {
      currency: "USD",
      showCents: true,
      compactNumbers: false,
    }
    assert.equal(formatFinanceMoney("nope", display), "—")
    assert.equal(formatFinanceMoney("10", { ...display, currency: "" }), "—")
  })
})
```

- [ ] **Step 2: Run the focused test and verify the new contract fails**

Run:

```bash
node --test --experimental-strip-types src/modules/finance/lib/money.spec.ts
```

Expected: FAIL because the current formatter does not consistently prepend ISO and use the requested narrow symbol.

- [ ] **Step 3: Implement the deterministic formatter**

Replace `formatFinanceMoney` with:

```ts
export function formatFinanceMoney(
  value: string | number | null | undefined,
  display: FinanceMoneyDisplay,
): string {
  const amount = parseFinanceMoney(value)
  const currency = display.currency.trim().toUpperCase()
  if (amount === null || !currency) {
    return "—"
  }

  try {
    const symbol = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value

    if (!symbol) {
      return "—"
    }

    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: display.showCents ? 2 : 0,
      maximumFractionDigits: display.showCents ? 2 : 0,
      notation: display.compactNumbers ? "compact" : "standard",
    }).format(Math.abs(amount))
    const sign = amount < 0 ? "-" : ""

    return `${currency} ${sign}${symbol}${formattedAmount}`
  } catch {
    return "—"
  }
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
node --test --experimental-strip-types src/modules/finance/lib/money.spec.ts
```

Expected: all `money.spec.ts` tests PASS with zero failures.

- [ ] **Step 5: Commit the isolated formatter change**

```bash
git add src/modules/finance/lib/money.ts src/modules/finance/lib/money.spec.ts
git commit -m "fix(finance): standardize displayed money format"
```

### Task 2: Remove raw read-only amount presentations

**Files:**
- Modify: `src/modules/finance/components/catalog/card-balance-sheet.tsx`
- Modify: `src/modules/finance/components/catalog/account-sheet.tsx`
- Modify: `src/modules/finance/components/accounts/institution-detail-view.tsx`
- Modify: `src/modules/finance/components/accounts/cash-account-detail-view.tsx`
- Modify: `src/modules/finance/components/sync/finance-sync.tsx`
- Modify: `src/modules/finance/components/sync/assign-email-message-sheet.tsx`
- Test: `src/modules/finance/lib/money-presentation.spec.ts`

**Interfaces:**
- Consumes: the formatter contract from Task 1 and existing `FinanceMoneyDisplay`.
- Produces: `display: FinanceMoneyDisplay` props for account, card-balance, and assignment sheets; every non-editable balance or extracted amount uses `formatFinanceMoney`.

- [ ] **Step 1: Add a failing source-level regression test for known bypasses**

Create `src/modules/finance/lib/money-presentation.spec.ts`:

```ts
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"

const financeRoot = join(dirname(fileURLToPath(import.meta.url)), "..")

function financeSource(path: string): string {
  return readFileSync(join(financeRoot, path), "utf8")
}

describe("finance money presentations", () => {
  it("does not render known raw amount expressions", () => {
    const sources = [
      financeSource("components/catalog/card-balance-sheet.tsx"),
      financeSource("components/catalog/account-sheet.tsx"),
      financeSource("components/sync/finance-sync.tsx"),
      financeSource("components/sync/assign-email-message-sheet.tsx"),
    ].join("\n")

    assert.equal(sources.includes("{item.balance}"), false)
    assert.equal(sources.includes("${created.balance}"), false)
    assert.equal(sources.includes("${payload.amount} ${payload.currency"), false)
    assert.equal(sources.includes("${extracted.amount} ${extracted.currency"), false)
  })
})
```

- [ ] **Step 2: Run the regression test and verify it fails**

Run:

```bash
node --test --experimental-strip-types src/modules/finance/lib/money-presentation.spec.ts
```

Expected: FAIL because all four raw amount patterns are currently present.

- [ ] **Step 3: Format card balances and account creation feedback**

In `card-balance-sheet.tsx`, add a required `display: FinanceMoneyDisplay` prop, import `formatFinanceMoney`, forward the prop into `CardBalanceSheetForm`, and render:

```tsx
{formatFinanceMoney(item.balance, {
  ...display,
  currency: item.currency,
})}
```

In `account-sheet.tsx`, add a required `display: FinanceMoneyDisplay` prop, import `formatFinanceMoney`, and change the success detail to:

```ts
text2: `El saldo arranca en ${formatFinanceMoney(created.balance, {
  ...display,
  currency: created.currency,
})}.`,
```

Pass the existing `display` object from both account sheet call sites and from the institution detail card-balance call site.

- [ ] **Step 4: Format extracted email amounts with entity currency or base fallback**

In `finance-sync.tsx`, destructure `config` from `useFinanceEnabled`, construct the existing display shape, and change `pendingRowValue` to accept it:

```ts
function pendingRowValue(
  message: FinancePendingEmailMessage,
  display: FinanceMoneyDisplay,
): string {
  const payload = message.extractedPayload
  const amount =
    payload?.amount != null
      ? formatFinanceMoney(payload.amount, {
          ...display,
          currency: payload.currency ?? display.currency,
        })
      : message.lastFourHint
        ? `****${message.lastFourHint}`
        : "Sin monto"
  return `${message.institutionName} · ${amount}`
}
```

Use `pendingRowValue(item, display)` and pass `display` to `AssignEmailMessageSheet`.

In `assign-email-message-sheet.tsx`, add the required display prop and replace the raw extracted amount with:

```ts
extracted.amount != null
  ? formatFinanceMoney(extracted.amount, {
      ...display,
      currency: extracted.currency ?? display.currency,
    })
  : null,
```

No extra page prop is required because `FinanceSyncList` already owns the finance configuration hook.

- [ ] **Step 5: Run the regression and complete finance test suite**

Run:

```bash
node --test --experimental-strip-types src/modules/finance/lib/money-presentation.spec.ts
npm test
```

Expected: the regression test and complete test suite PASS with zero failures.

- [ ] **Step 6: Verify types, lint, and the final source audit**

Run:

```bash
npm run typecheck
npm run lint -- src/modules/finance
rg '\{item\.balance\}|\$\{created\.balance\}|\$\{(payload|extracted)\.amount\}' src/modules/finance
```

Expected: TypeScript and ESLint exit 0. The final search returns no raw presentation matches outside editable form values or tests.

- [ ] **Step 7: Review the diff without committing pre-existing user work**

Run:

```bash
git diff -- src/modules/finance
git status --short
```

Expected: only the planned formatting edits are attributable to this task. Because some target files already contain user changes, leave Task 2 uncommitted rather than staging unrelated work.
