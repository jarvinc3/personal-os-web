# Finance — reglas de cliente

Dominio ledger/money: backend `BR-FIN-*`. Aquí solo UX y consumo.

| ID | Condición | Resultado | Evidencia |
| --- | --- | --- | --- |
| `BR-FIN-W-001` | Módulo finance `isEnabled=false` | CTA Settings `?sheet=finance-sheet`; **no** llama `/finance/*` | `useFinanceEnabled` |
| `BR-FIN-W-002` | Lecturas money | Decimal **strings**; writes **numbers** | `parseFinanceMoney` / `formatFinanceMoney` |
| `BR-FIN-W-003` | Loan `interestRate` | UI % → API fracción 0–1 | planning |
| `BR-FIN-W-004` | Ruta `/finance/budgets` | No hay `page.tsx` (404 Next). Presupuestos en `/finance/planning` | REV-WEB-012 |
| `BR-FIN-W-005` | Tab bar | 4 ítems; Estadísticas `showInTabBar: false`; Sync no es tab | `FINANCE_APP_NAV` |
