# Estado de implementación: módulo de finanzas

Corte: develop al 14 oct 2026, 6:30 AM (hora Bolivia). Web v0.27.1 (`12eb305`), back v0.25.1 (`c3f99bd`). La lista de commits de abajo es del corte anterior (13 oct).

- Web: v0.20.1, `5e7cafc` (pi todavía no ha subido commits del pendiente 01)
- Back: v0.20.0, `b2ed481`

Commits desde el corte anterior (web `fd0630c` / back `bfcfded`):

- Web: `1ada4fc` (docs: `docs/modules/finance/dominio.md` y specs de pendientes), `4864b5c` (v1.18.1), `503c222` (UI de presupuestos, planificación, transacciones y selectores de categoría), `fbf8eff` (v1.19.0), `24af820` (v0.20.0, reinicio del versionado beta), `d512f63` (corrige typecheck; `keepAwake` sale de la configuración de módulos), `f2a8fe3` (selector de categorías unificado con selección múltiple), `5e7cafc` (v0.20.1)
- Back: `5215694` (v1.19.1), `54fa2d4` (endpoints de historial de cuentas y tarjetas, `CONTEXT.md`, swagger), `b2ed481` (v0.20.0, reinicio del versionado beta)

No se tuvieron en cuenta la app móvil ni los scripts de datos.

Leyenda: ✅ implementado · 🟡 parcial · ❌ pendiente · 🔄 en curso · n/a no verificable desde el código

## Producción y versionado

- ✅ Producción (Railway): las 14 migraciones pendientes se aplicaron el 2026-10-13. El pre-deploy corre `pnpm db:migrate:deploy`, así que cada deploy migra solo.
- ✅ Versionado reiniciado en `v0.20.0` en web y back; se borraron los tags `v1.x`. La política está en `docs/versionado.md` y en `.cursor/rules/versionado.mdc` (enlazada desde `AGENTS.md`). `1.0.0` queda reservada para cuando el núcleo sea estable.
- ✅ Marca beta en el README de ambos repos y badge "Beta" en la barra lateral de la web.

## Implementado (resumen)

Las 9 fases de la spec de alineación (estados y edición, transferencias, tarjetas y pagos, préstamos, metas, cobros, presupuestos, ingesta y dedupe, restaurar y diario) están completas en back y web. El detalle de cómo funciona hoy el módulo está en `docs/modules/finance/dominio.md`. Incluye:

- Bloqueo de edición en completados y desbloqueo (`unconfirm`); reversas en gris fuera de los totales; transferencia en una sola fila.
- Flujo guiado categoría → monto → cuenta; vínculo de movimientos con cuota, cobro o meta (`link_transaction`).
- Pago de tarjeta, corte manual con estado y mínimo; préstamos con amortización y abono a capital.
- Ingesta de correo con dedupe, modo directo o pendiente, nómina de Popular; configuración de Finanzas (ingreso fijo, cuenta por defecto, correo, sincronización automática en Configuración).
- Historial de cuentas y tarjetas (back `54fa2d4`).
- ✅ Selector de categorías unificado (v0.20.1): el sheet compartido de transacciones y transferencias admite selección múltiple con `value: string[]` y `onChange`; el trigger muestra una X por categoría y estado deshabilitado. Presupuestos y "Categoría padre" ya lo usan.

## Pendientes

Cada pendiente es un spec en `docs/modules/finance/pendientes/` (índice en `README.md`). pi los implementa uno por sesión, en orden.

| #                                                                                                          | Spec                                        | Estado                 | Nota                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 01                                                                                                         | `01-agrupar-reversas.md`                    | ✅                     | web v0.21.0–v0.21.2                                                                                                         |
| 02                                                                                                         | `02-importar-estado-de-cuenta.md`           | ✅                     | Subida manual de PDF (pdf.js + BullMQ + extractor LLM), sin correo. web v0.22.x / back v0.21.x                              |
| 03                                                                                                         | `03-sync-tras-conectar-correo.md`           | ✅                     | web v0.23.x                                                                                                                 |
| 04                                                                                                         | `04-paginacion-uniforme.md`                 | ✅                     | web v0.24.x / back v0.22.x                                                                                                  |
| 05                                                                                                         | `05-agente-entity-ref.md` (spec borrada)    | ✅                     | `entityRef` en el chat. web v0.25.x / back v0.23.x                                                                          |
| 06                                                                                                         | `06-agente-bloques-captura-resumen.md`      | ✅                     | Bloques visuales, captura rápida y resumen semanal. web v0.26.0–v0.26.3 / back v0.24.0–v0.24.4                              |
| 07                                                                                                         | `07-comercios-recurrentes-suscripciones.md` | ✅ (revisión en curso) | Comercios (atajo en Productos) y detección básica de recurrentes. web v0.27.x / back v0.25.x                                |
| 08                                                                                                         | `08-suscripciones.md`                       | implementado           | Gestor completo dentro de Finanzas, vista principal del tab bar entre Planificación y Productos. web v0.28.0 / back v0.26.0 |
| Fuera de alcance del código: branding de OAuth, dominio propio de Supabase y CASA (configuración externa). |
