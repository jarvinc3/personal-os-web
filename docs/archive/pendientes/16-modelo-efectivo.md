# 16 · Modelo de efectivo

> Hoy el efectivo son cuentas `CASH` sin institución (`institution_id` nulo, permitido por el check de `fin_accounts`), y el usuario puede crear cuantas quiera. El anillo de Efectivo en Productos no mide cuando esas cuentas tienen monedas distintas («Balance incompleto», revisión del 13). Este pendiente agrupa el efectivo bajo una institución de sistema «Efectivo», con una cuenta por moneda y el total convertido a la moneda del usuario. Decisiones aprobadas por Jarvin el 15 oct 2026.

## Estado verificado (back v0.32.3, web v0.35.1)

- Back: `FinAccount.institutionId` es opcional solo para `CASH` (check `type = 'CASH' OR institution_id IS NOT NULL`); `CASH` no admite `accountNumber` ni ser `isDefaultForInstitution` (`catalog.service.ts`). `FinInstitution.type` ya admite `cash`. La relación cuenta-institución es `onDelete: Cascade`. Cada cuenta tiene una sola `currency` (default `DOP`). La moneda base del usuario es `baseCurrency` en los ajustes (`user-settings-defaults.ts`, default `DOP`). Las tasas viven en `fin_exchange_rates` y se convierten con `convertDecimal` (`shared/domain/money.ts`).
- Web: Productos lista el efectivo como grupo propio («Efectivo», ruta `financeCashAccount`) y ofrece crear «una cuenta de efectivo sin institución». El anillo (`ring-chart.tsx`, `ring-stack`) solo suma efectivo en moneda base. El detalle de institución (`institution-detail-screen.tsx`, `institution-product-lists.tsx`) muestra cuentas, tarjetas y préstamos; los selectores de institución están en `shared/components/pickers/institution-picker.tsx`.

## Comportamiento esperado

1. **Institución de sistema.** Cada usuario tiene exactamente una institución «Efectivo» (`type = 'cash'`, marcada como de sistema). Se crea sola e idempotente (al crear el usuario y, para los existentes, por migración/backfill). No se puede borrar, desactivar, renombrar ni editar; no tiene logo de banco, se muestra con un icono de efectivo.
2. **Una moneda por cuenta.** Ninguna cuenta maneja dos monedas. Por defecto existe la cuenta «Efectivo» en la `baseCurrency` del usuario (DOP si no hay).
3. **Otras monedas.** La primera vez que el usuario registra un movimiento de efectivo en otra moneda (o elige esa moneda al crear), se le ofrece crear «Efectivo <moneda>» (p. ej. «Efectivo USD») dentro de la institución.
4. **Fondos extra.** Por defecto, una cuenta por moneda. Dentro de Efectivo hay un «Agregar cuenta» discreto para fondos aparte (caja chica, sobre, dólares de viaje), cada uno con su saldo y moneda. Mover dinero entre ellos es una transferencia normal.
5. **Sin tarjetas ni préstamos.** La institución Efectivo no tiene tarjetas de crédito ni débito ni préstamos: su vista oculta esas secciones, no aparece en los selectores de institución para tarjetas y préstamos, y el back rechaza crearlos ligados a ella. Se ocultan los campos bancarios (número de cuenta, cuenta por defecto para correos, sincronización por correo/`fin_email_sources`).
6. **Total convertido.** La tarjeta de Efectivo en Productos muestra el total convertido a la moneda de preferencia (`baseCurrency`) con la tasa del día, y al abrirla el desglose por moneda y cuenta. El anillo de Efectivo usa ese total convertido; reemplaza el fallback «Balance incompleto» por monedas mixtas. Si falta una tasa, se mantiene un fallback: el total marca «Balance incompleto» (o «sin tasa») y el desglose sigue mostrando cada moneda sin convertir.
7. **Decimales exactos.** Toda suma y conversión sigue las reglas del 13 (`Prisma.Decimal` / `decimal.js-light`, `ROUND_HALF_EVEN`, strings en la API, `pnpm lint:money`). La conversión se hace en el back; el cliente no suma monedas distintas (ADR-002).

## Back

- **Esquema:** marcar la institución de sistema (p. ej. `isSystem Boolean @default(false)` en `fin_institutions`) y un índice único parcial `(user_id) WHERE type = 'cash' AND is_system`. Evaluar endurecer el check para que `CASH` exija `institution_id` tras el backfill (ver Preguntas).
- **Migración y backfill** (fecha posterior a la última, sin drift): crear la institución Efectivo para cada usuario que no la tenga; mover todas las cuentas `CASH` sin institución a la de su usuario (`UPDATE ... SET institution_id`), sin tocar `fin_transactions`, saldos ni reconciliaciones; si el usuario no tiene efectivo, crear «Efectivo» en su `baseCurrency`. Idempotente.
- **Alta de usuario:** caso de uso `ensureCashInstitution(userId)` idempotente, llamado al crear usuario y al listar instituciones/productos como red de seguridad.
- **Reglas en `catalog.service.ts`:** rechazar update/delete/desactivar de la institución de sistema (403/409 con mensaje claro); rechazar `institutionId` de Efectivo en crear/editar tarjeta y préstamo; rechazar `accountNumber`, `isDefaultForInstitution` y fuentes de correo en Efectivo; las cuentas dentro de Efectivo son siempre `CASH` y las `CASH` nuevas sin institución se asignan a Efectivo.
- **Oferta de nueva moneda:** endpoint o campo en la respuesta (p. ej. `missingCashCurrencies` o un `409 CASH_ACCOUNT_MISSING_CURRENCY` al registrar efectivo en una moneda sin cuenta) para que la web ofrezca crear «Efectivo <moneda>».
- **Resumen de efectivo:** en el balance general/Productos, `cash: { totalBase, baseCurrency, rateDate, status: COMPLETE|INCOMPLETE, byCurrency: [{ currency, total, totalBase|null, accounts[] }] }` calculado con `convertDecimal` y la tasa del día (última disponible ≤ hoy, criterio igual al del balance general).
- Respuestas de institución incluyen `isSystem` para que la web oculte acciones.
- Ignorar el agente de IA salvo que sus herramientas creen cuentas `CASH` sin institución: en ese caso, pasar por `ensureCashInstitution`.

## Web

- Productos: Efectivo se muestra como una tarjeta de institución con icono de efectivo y el total convertido; quitar el texto «cuenta de efectivo sin institución». El anillo usa `cash.totalBase` del back; fallback si `status = INCOMPLETE`.
- Detalle de Efectivo: desglose por moneda y cuentas; ocultar tarjetas, préstamos, editar/borrar institución, logo y sincronización por correo; «Agregar cuenta» discreto (sheet con nombre y moneda, tipo fijo `CASH`).
- Selectores (`institution-picker.tsx` y formularios de tarjeta y préstamo): excluir instituciones `isSystem`/`type = 'cash'`.
- Formulario de cuenta (`account-form.ts`, `account-sheet.tsx`): dentro de Efectivo, ocultar número de cuenta y «por defecto para correos».
- Oferta de moneda: al registrar efectivo en una moneda sin cuenta, sheet de confirmación «Crear Efectivo USD».
- Lógica pura en `.ts` (filtro de instituciones, visibilidad de secciones, armado del desglose, decisión de ofrecer cuenta nueva) con specs `*.spec.ts`. Sin dependencias nuevas.

## Criterios de aceptación

- [ ] Todo usuario, nuevo o existente, tiene exactamente una institución Efectivo; correr el backfill dos veces no duplica nada.
- [ ] Las cuentas de efectivo existentes quedan dentro de Efectivo con los mismos movimientos, saldos y reconciliaciones.
- [ ] Un usuario nuevo ve «Efectivo» en su `baseCurrency` (DOP si no hay) sin crear nada.
- [ ] La API rechaza editar o borrar Efectivo, y crear tarjetas o préstamos ligados a ella.
- [ ] Efectivo no aparece en los selectores de institución de tarjetas y préstamos, y su vista no muestra tarjetas, préstamos, número de cuenta ni sincronización por correo.
- [ ] Registrar efectivo en una moneda sin cuenta ofrece crear «Efectivo <moneda>».
- [ ] Con RD$ 1 000.00 y US$ 10.00 en efectivo y tasa 60.00, la tarjeta y el anillo muestran RD$ 1 600.00, y el desglose ambas monedas.
- [ ] Sin tasa para una moneda, el total muestra el fallback y el desglose sigue visible.
- [ ] Se puede agregar una segunda cuenta de efectivo en la misma moneda y transferir entre ellas.
- [ ] `pnpm lint:money` pasa y no hay drift de Prisma.

## Casos borde

- Usuario con varias cuentas `CASH` en la misma moneda: se mueven todas; ninguna se fusiona.
- Cuentas `CASH` inactivas: se mueven también, siguen inactivas.
- Usuario que ya creó a mano una institución `type = 'cash'`: ver Preguntas.
- Cambio de `baseCurrency` después: no renombra ni crea cuentas; solo cambia la moneda del total convertido.
- Borrar la última cuenta de efectivo: permitido o no (ver Preguntas); la institución sigue existiendo.
- Tasa del día ausente pero hay una anterior: usar la última disponible y mostrar su fecha.
- `wipe-user-data` / borrar saldos por institución: Efectivo se vacía pero no se borra, y se recrea idempotente.

## Tests

- Back: backfill idempotente y migración de cuentas existentes; `ensureCashInstitution`; rechazos de editar/borrar, de tarjetas/préstamos y campos bancarios; resumen de efectivo multimoneda al centavo y sin tasa.
- Web: specs de filtro de selectores, visibilidad de secciones, desglose por moneda y oferta de cuenta nueva.

## Fuera de alcance

- La app móvil (`personal-os-app`).
- Cuentas con más de una moneda.
- Conversión automática de saldos entre monedas o compraventa de divisas como operación propia (sigue siendo una transferencia entre cuentas).

## Decisiones tomadas

Jarvin aprobó el 2026-10-15 las cuatro recomendaciones de abajo: 1 sí, CHECK estricto tras el backfill; 2 reusar la institución cash existente y marcarla como sistema; 3 la cuenta Efectivo en moneda base no se borra, solo se desactiva; 4 las cuentas se pueden renombrar, solo el nombre de la institución es fijo. El punto 5 se verifica durante la implementación.

## Preguntas resueltas para Jarvin

1. ¿Las cuentas `CASH` pasan a exigir institución (endurecer el check tras el backfill) o se sigue permitiendo `institution_id` nulo? Recomendado: exigirla.
2. Si un usuario ya tiene una institución propia `type = 'cash'`: ¿se convierte en la de sistema, o se crea una nueva y se mueven sus cuentas? Recomendado: reutilizar la primera y marcarla de sistema.
3. ¿Se puede borrar la cuenta «Efectivo» de la moneda base (por ejemplo si queda en cero)? Recomendado: no borrarla, solo desactivarla.
4. ¿Las cuentas dentro de Efectivo se pueden renombrar («Billetera» en vez de «Efectivo»)? Recomendado: sí; lo fijo es la institución.
5. La cascada `onDelete: Cascade` de institución a cuentas: con Efectivo no borrable deja de ser riesgo, pero conviene confirmar que ningún flujo (wipe por institución) la borre.

## Versión esperada

MINOR en ambos repos: web v0.36.0 / back v0.33.0 (después del 15, que publica web v0.35.2). Revisión como PATCH.
