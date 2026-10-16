# 02 · Importar estado de cuenta (PDF) y conciliar

> **Implementado el 14 oct 2026.** Lo que quedó en el producto se resume en [../../modules/finance/dominio.md](../../modules/finance/dominio.md). Esta spec se conserva como registro.
> Ajustes respecto al plan original: la ingesta desde correo se descartó (los bancos no envían estados de cuenta por correo; la subida es siempre manual) y la cabecera del corte de una cuenta bancaria vive en el JSON del import.

## Problema

El corte de tarjeta se carga a mano (`card-statement-sheet.tsx`): balance al corte, mínimo y fecha límite. No se importan los movimientos del ciclo ni se compara contra lo registrado. `POST /finance/cards/:id/statements/import` existía pero lanzaba `NotImplementedException('Próximamente')`.

Realidad del usuario (bancos dominicanos):

- BHD, Popular y Qik: el estado de cuenta se descarga a mano desde la web o la app del banco (PDF).
- Tarjetas: BHD Visa 6506, BHD Mastercard 5873; débito Popular 5089. Cuentas: Popular 3447, Qik 3695.

## Comportamiento esperado

1. En el detalle de la tarjeta (y de la cuenta bancaria), "Importar estado de cuenta" → subir PDF (máx. 10 MB). Si el PDF tiene clave, pedirla (no se guarda).
2. El back extrae: periodo, balance anterior, balance al corte, mínimo, fecha límite y movimientos `{fecha, descripción, monto, moneda, tipo, referencia?}`.
3. Pantalla de **conciliación** con tres grupos:
   - **Coinciden**: movimiento del PDF ↔ movimiento existente (mismo monto y moneda, ±3 días, descripción parecida o misma referencia).
   - **Faltan en la app**: se ofrecen para crear (categoría sugerida), con selección múltiple.
   - **Sobran en la app**: registrados en el ciclo y ausentes del PDF (posible duplicado, pendiente aún no posteado o error). Se listan para revisarlos aparte.
4. Diferencia de saldo: si tras aplicar sigue habiendo diferencia, ofrecer un ajuste (`ADJUSTMENT`) por el monto exacto.
5. Al confirmar: el corte queda cerrado con los datos importados (`CLOSED`), los movimientos creados quedan `CONFIRMED` y vinculados al import.

## Back (`packages/finance`)

- Modelos `FinStatementImport` y `FinStatementImportLine` (migración `20261015230000_fin_statement_imports`). El archivo no se guarda; la cabecera parseada vive en `parsed` (JSON).
- `POST /finance/cards/:id/statements/import` y `POST /finance/accounts/:id/statements/import` (multipart `file`, `password?`) → crea el import y devuelve `{ importId }`. El parseo corre en la cola `statement-import`; si BullMQ no está disponible, corre en la misma petición.
- `GET /finance/statement-imports/:id` → estado, cabecera, líneas con la propuesta de match, movimientos que sobran y diferencia de saldo.
- `PATCH /finance/statement-imports/:id/lines/:lineId` → cambiar decisión (`MATCH`, `CREATE`, `IGNORE`).
- `POST /finance/statement-imports/:id/apply` → crea los movimientos marcados, cierra el corte y ajusta la diferencia si el usuario lo pide. Idempotente.
- `DELETE /finance/statement-imports/:id` → descartar.
- Extracción: texto con `pdfjs-dist/legacy` (PDF con clave) y extractor LLM con esquema estricto (`ai-statement.extractor.ts`), detrás de los tokens `STATEMENT_PDF_TEXT` y `STATEMENT_EXTRACTOR`.
- Matcher puro `statement-line-matching.ts` con specs: referencia igual > monto+moneda+±3d+similitud de texto ≥ 0.8.
- Fixtures sintéticos por banco en `test/fixtures/bank-statements/{bhd,popular,qik}/`.

## Web

- Botón "Importar estado de cuenta" en `card-statements-section.tsx` y en el detalle de la cuenta.
- Hook `use-statement-import.ts` (subida, polling de estado con React Query, marcar líneas, aplicar, descartar).
- Vista `/finance/statement-imports/[importId]`: cabecera (periodo, saldos, mínimo, fecha límite), tres grupos con checkbox, diferencia y CTA "Aplicar".
- Errores en `finance-error-messages.ts` (`STATEMENT_PARSE_FAILED`, `STATEMENT_PASSWORD_REQUIRED`, `STATEMENT_ALREADY_APPLIED`).

## Criterios de aceptación

- [x] Subir un PDF de BHD/Popular/Qik de prueba produce un import `READY` con líneas correctas.
- [x] Coinciden / faltan / sobran se calculan bien (specs del matcher).
- [x] Aplicar crea solo lo marcado, actualiza el corte y es idempotente.
- [x] La diferencia final ofrece un ajuste exacto.
- [x] PDF con clave pide la clave y no la persiste.
- [x] Migración sin drift; e2e del flujo upload → apply.

Depende de 04 (paginación de líneas si son muchas) y se beneficia de 07 (comercios para emparejar descripciones).
