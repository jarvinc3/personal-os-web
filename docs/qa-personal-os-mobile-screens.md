# Capturas móviles · Personal OS (web app, 390 px)

- **Fecha:** 11 oct 2026
- **Carpeta:** `/personal-os-web/public/images/mobile-screens/` (67 capturas; 01–50 a 390×839, 51–73 a 390×729; 57–62 retiradas)
- **Figma:** [https://www.figma.com/design/uCaMC4OEAAPOBdJ0oux9IW](https://www.figma.com/design/uCaMC4OEAAPOBdJ0oux9IW) (página "Pantallas móviles")

## Errores encontrados

1. **Detalle de préstamo:** la API devuelve 500 y la parte inferior se queda en esqueleto de carga (`13-loan-detail-api500.png`).
2. **Detalle de presupuesto:** "Movimientos del periodo" falla con "categoryId must be a UUID" (400) (`16-budget-detail-error.png`).
3. **Detalle de tarjeta:** una llamada a `/api/finance/budgets/…` devuelve 500.
4. **Movimientos:** `GET /api/finance/email-sync/…` devuelve 500.
5. **Correos:** errores "Gmail tokens could not be decrypted" en Qik, Popular y BHD.

> Corrección: en el informe anterior se reportó que `/finance/transactions/new?type=TRANSFER` debía abrir el formulario de transferencia. No era un bug: la ruta real es `/finance/transfers/new` y funciona (`63-transfers-new-form.png`).

## Lista de pantallas

1. `01-home.png`
2. `02-drawer-menu.png`
3. `03-drawer-finanzas-expanded.png`
4. `04-finance-transactions.png`
5. `05-transaction-detail.png`
6. `06-finance-fab-menu.png`
7. `07-new-expense-category-picker.png`
8. `08-new-expense-form.png`
9. `09-new-income-form.png`
10. `10-new-transfer-form.png`
11. `11-planning-ahorros.png`
12. `12-planning-prestamos.png`
13. `13-loan-detail-api500.png`
14. `14-planning-cobros-empty.png`
15. `15-planning-presupuestos.png`
16. `16-budget-detail-error.png`
17. `17-finance-products-a.png`
18. `18-finance-products-b-scrolled.png`
19. `19-institution-detail-cuentas.png`
20. `20-institution-detail-tarjetas.png`
21. `21-card-detail-estados.png`
22. `22-card-detail-movimientos.png`
23. `23-institution-detail-prestamos-empty.png`
24. `24-account-detail.png`
25. `25-finance-categories-gastos.png`
26. `26-finance-categories-ingresos.png`
27. `27-finance-sync-correos-a.png`
28. `28-finance-sync-correos-b-scrolled.png`
29. `29-notifications.png`
30. `30-chat-agente-ia.png`
31. `31-chat-history-sheet.png`
32. `32-settings-a.png`
33. `33-settings-b-middle.png`
34. `34-settings-c-bottom.png`
35. `35-settings-finance-a.png`
36. `36-settings-finance-b-bottom.png`
37. `37-settings-finance-currencies.png`
38. `38-settings-agenda-a.png`
39. `39-settings-agenda-b-bottom.png`
40. `40-settings-projects.png`
41. `41-settings-subscriptions.png`
42. `42-settings-health.png`
43. `43-settings-wipe-data-a.png`
44. `44-settings-wipe-data-b-bottom.png`
45. `45-keep-awake.png`
46. `46-keep-awake-history-sheet.png`
47. `47-keep-awake-help-sheet.png`
48. `48-settings-profile-sheet.png`
49. `49-settings-theme-sheet.png`
50. `50-settings-ai-tone-sheet.png`
51. `51-settings-ai-provider-sheet.png`
52. `52-settings-quiet-hours-sheet.png`
53. `53-settings-notifications-privacy-permission-toast.png`
54. `54-settings-delete-account-sheet.png`
55. `55-settings-delete-account-password-confirm.png`
56. `56-settings-user-menu.png`
57. `63-transfers-new-form.png`
58. `64-planning-ahorros-empty.png`
59. `65-planning-cobros-empty.png`
60. `66-receivable-create-form-empty.png`
61. `67-receivable-create-form-filled-input.png`
62. `68-planning-cobros-list-with-test-receivable.png`
63. `69-receivable-detail.png`
64. `70-savings-goal-create-form-empty.png`
65. `71-savings-goal-create-form-filled-optional-details.png`
66. `72-planning-ahorros-list-with-test-goal.png`
67. `73-savings-goal-detail.png`

### Notas de rutas (51–73)

- 54–55: `/settings?sheet=delete-account-sheet`
- 57–62 (Banco Popular y BHD) se retiraron a `/workspace/qa-personal-os/removed/`: el detalle de institución ya está cubierto por Auditoría Banco (19, 20, 23).
- 63: `/finance/transfers/new`
- 64: `/finance/planning?tab=savings`; 65: `?tab=receivables`; 66–67: `?tab=receivables&sheet=receivable-sheet`
- 69: `/finance/receivables/<id>`; 70–71: `?tab=savings&sheet=savings-sheet`; 73: `/finance/savings-goals/<id>`
- Resto: `/settings` o `/finance/planning`
