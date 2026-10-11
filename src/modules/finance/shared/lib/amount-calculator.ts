export const CALCULATOR_OPS = ["+", "-", "×", "÷"] as const
export type CalculatorOp = (typeof CALCULATOR_OPS)[number]

export type CalculatorKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "."
  | "C"
  | "backspace"
  | CalculatorOp
  | "%"
  | "="

export type CalculatorState = {
  /** Finished numbers and operators, not including the number being typed. */
  parts: string[]
  /** Operand in progress. Null right after an operator. */
  draft: string | null
  justEvaluated: boolean
}

const DIGITS = new Set<CalculatorKey>([
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
])

export function isCalculatorOp(value: string): value is CalculatorOp {
  return (CALCULATOR_OPS as readonly string[]).includes(value)
}

export function formatCalculatorDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return "0"
  }
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10
  if (rounded === 0) {
    return "0"
  }
  return String(rounded)
}

export function createCalculatorState(seed?: string): CalculatorState {
  return {
    parts: [],
    draft: seedDisplay(seed),
    justEvaluated: false,
  }
}

export function applyCalculatorKey(
  state: CalculatorState,
  key: CalculatorKey
): CalculatorState {
  if (key === "C") {
    return createCalculatorState()
  }
  if (key === "backspace") {
    return backspace(state)
  }
  if (key === "%") {
    return applyPercent(state)
  }
  if (key === "=") {
    return applyEquals(state)
  }
  if (isCalculatorOp(key)) {
    return applyOperator(state, key)
  }
  if (key === ".") {
    return applyDecimal(state)
  }
  if (DIGITS.has(key)) {
    return applyDigit(state, key)
  }
  return state
}

/** Full operation shown as the primary line, e.g. `589056 × 56 - 89 + 70`. */
export function calculatorHeadline(state: CalculatorState): string {
  const chunks = [...state.parts]
  if (state.draft !== null) {
    chunks.push(state.draft)
  }
  if (chunks.length === 0) {
    return "0"
  }
  return chunks.join(" ")
}

/** Number written back into the amount field. Trailing operators are ignored. */
export function calculatorCommitValue(state: CalculatorState): string {
  return formatCalculatorDisplay(evaluate(state))
}

function seedDisplay(seed?: string): string {
  const trimmed = seed?.trim() ?? ""
  if (!trimmed) {
    return "0"
  }
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) {
    return "0"
  }
  return formatCalculatorDisplay(parsed)
}

function currentNumber(display: string): number {
  const normalized = display.endsWith(".") ? display.slice(0, -1) : display
  if (!normalized || normalized === "-") {
    return 0
  }
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function compute(left: number, op: CalculatorOp, right: number): number {
  if (op === "+") {
    return left + right
  }
  if (op === "-") {
    return left - right
  }
  if (op === "×") {
    return left * right
  }
  if (right === 0) {
    return Number.NaN
  }
  return left / right
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0
}

function evaluate(state: CalculatorState): number {
  const tokens = [...state.parts]
  if (state.draft !== null) {
    tokens.push(state.draft)
  }
  if (tokens.length > 0 && isCalculatorOp(tokens[tokens.length - 1] ?? "")) {
    tokens.pop()
  }
  if (tokens.length === 0) {
    return 0
  }
  let acc = currentNumber(tokens[0] ?? "0")
  for (let index = 1; index < tokens.length; index += 2) {
    const op = tokens[index]
    const right = tokens[index + 1]
    if (!op || !isCalculatorOp(op) || right === undefined) {
      break
    }
    acc = finiteOrZero(compute(acc, op, currentNumber(right)))
  }
  return acc
}

function fresh(draft: string): CalculatorState {
  return { parts: [], draft, justEvaluated: false }
}

function applyDigit(
  state: CalculatorState,
  digit: CalculatorKey
): CalculatorState {
  if (state.justEvaluated) {
    return fresh(digit)
  }
  if (state.draft === null || state.draft === "0") {
    return { ...state, draft: digit, justEvaluated: false }
  }
  return { ...state, draft: `${state.draft}${digit}`, justEvaluated: false }
}

function applyDecimal(state: CalculatorState): CalculatorState {
  if (state.justEvaluated) {
    return fresh("0.")
  }
  if (state.draft === null) {
    return { ...state, draft: "0.", justEvaluated: false }
  }
  if (state.draft.includes(".")) {
    return state
  }
  return { ...state, draft: `${state.draft}.`, justEvaluated: false }
}

function applyOperator(
  state: CalculatorState,
  op: CalculatorOp
): CalculatorState {
  if (state.justEvaluated) {
    return {
      parts: [state.draft ?? "0", op],
      draft: null,
      justEvaluated: false,
    }
  }
  if (state.draft === null) {
    if (state.parts.length === 0) {
      return { parts: ["0", op], draft: null, justEvaluated: false }
    }
    const last = state.parts[state.parts.length - 1]
    if (last && isCalculatorOp(last)) {
      return {
        ...state,
        parts: [...state.parts.slice(0, -1), op],
      }
    }
    return { ...state, parts: [...state.parts, op] }
  }
  const operand = state.draft.endsWith(".")
    ? state.draft.slice(0, -1) || "0"
    : state.draft
  return {
    parts: [...state.parts, operand, op],
    draft: null,
    justEvaluated: false,
  }
}

function applyEquals(state: CalculatorState): CalculatorState {
  return {
    parts: [],
    draft: calculatorCommitValue(state),
    justEvaluated: true,
  }
}

function applyPercent(state: CalculatorState): CalculatorState {
  const base = state.justEvaluated ? fresh(state.draft ?? "0") : state
  const source = base.draft ?? "0"
  const display = formatCalculatorDisplay(currentNumber(source) / 100)
  return { ...base, draft: display, justEvaluated: false }
}

function backspace(state: CalculatorState): CalculatorState {
  const base = state.justEvaluated ? { ...state, justEvaluated: false } : state
  if (base.draft !== null && base.draft !== "0") {
    const next = base.draft.slice(0, -1)
    if (next === "" || next === "-") {
      return {
        ...base,
        draft: base.parts.length === 0 ? "0" : null,
      }
    }
    return { ...base, draft: next }
  }
  if (base.parts.length === 0) {
    return { ...base, draft: "0" }
  }
  const last = base.parts[base.parts.length - 1]
  const rest = base.parts.slice(0, -1)
  if (last && isCalculatorOp(last)) {
    const previous = rest[rest.length - 1]
    if (previous && !isCalculatorOp(previous)) {
      return { parts: rest.slice(0, -1), draft: previous, justEvaluated: false }
    }
    return { parts: rest, draft: null, justEvaluated: false }
  }
  return { parts: rest, draft: "0", justEvaluated: false }
}
