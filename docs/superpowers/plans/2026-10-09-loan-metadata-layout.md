# Loan Metadata Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Distribuir mejor los metadatos del préstamo y mostrar todas las fechas de Finanzas en español.

**Architecture:** El formateador compartido de fechas fijará el locale español. La tarjeta genérica aceptará un caption React y la tarjeta especializada mostrará frecuencia/tasa bajo el titular, con cuotas y vencimiento distribuidos en la fila inferior.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Node test runner.

## Global Constraints

- Mantener `LoanProgressCard` compartida entre Planificación e Institución.
- No agregar dependencias.
- Conservar compatibilidad con captions de texto existentes.

---

### Task 1: Formato español

**Files:**
- Modify: `src/modules/finance/lib/ledger-form.ts`
- Test: `src/modules/finance/lib/ledger-form.spec.ts`

**Interfaces:**
- Produces: `formatCalendarDate(value: string): string` con locale `es`.

- [ ] Cambiar la expectativa para exigir una fecha española.
- [ ] Ejecutar `node --test --experimental-strip-types src/modules/finance/lib/ledger-form.spec.ts` y comprobar que falla.
- [ ] Cambiar `toLocaleDateString(undefined, ...)` por `toLocaleDateString("es", ...)`.
- [ ] Repetir la prueba y comprobar que pasa.

### Task 2: Metadatos en dos filas

**Files:**
- Modify: `src/modules/finance/components/planning/planning-progress-card.tsx`
- Modify: `src/modules/finance/components/planning/loan-progress-card.tsx`

**Interfaces:**
- Consumes: `PlanningProgressCardProps.caption?: ReactNode`.
- Produces: frecuencia/tasa bajo el titular y una fila inferior con cuotas y `Próximo pago · <fecha>`.

- [ ] Ampliar `caption` de `string` a `ReactNode`.
- [ ] Renderizar los metadatos del préstamo como dos filas dentro de `LoanProgressCard`.
- [ ] Ejecutar `npm run typecheck`.
- [ ] Ejecutar ESLint sobre los archivos modificados.

### Task 3: Regresión completa

**Files:**
- Test: `src/modules/finance/lib/ledger-form.spec.ts`
- Test: `src/modules/finance/lib/planning-lists.spec.ts`

- [ ] Ejecutar ambas pruebas unitarias.
- [ ] Revisar diagnósticos del IDE en todos los archivos modificados.
