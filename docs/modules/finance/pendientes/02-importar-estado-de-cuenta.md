# 02 · Importar estado de cuenta (PDF o correo) y conciliar

## Problema

Hoy el corte de tarjeta se carga a mano (`card-statement-sheet.tsx`): balance al corte, mínimo y fecha límite. No se importan los movimientos del ciclo ni se compara contra lo registrado. `POST /finance/cards/:id/statements/import` existe pero lanza `NotImplementedException('Próximamente')` (`card-statements.service.ts`).

Realidad del usuario (bancos dominicanos):

- **BHD** envía "estado de cuenta disponible" (fixtures `estado-cuenta-ahorro-aviso`, `estado-cuenta-ahorro-pdf`), a veces con PDF adjunto; hoy solo genera el recordatorio `FINANCE_CARD_STATEMENT_REMINDER`.
- **Popular** y **Qik**: el estado se descarga a mano desde la app del banco (PDF).
- Tarjetas: BHD Visa 6506, BHD Mastercard 5873; débito Popular 5089. Cuentas: Popular 3447, Qik 3695.

## Comportamiento esperado

1. En el detalle de la tarjeta (y de la cuenta bancaria), "Importar estado de cuenta" → subir PDF (máx. 10 MB). Si el PDF tiene clave, pedirla (no se guarda).
2. El back extrae: periodo, balance anterior, balance al corte, mínimo, fecha límite y movimientos `{fecha, descripción, monto, moneda, referencia?}`.
3. Pantalla de **conciliación** con tres grupos:
   - **Coinciden**: movimiento del PDF ↔ movimiento existente (mismo monto y moneda, ±3 días, descripción parecida o misma referencia).
   - **Faltan en la app**: se ofrecen para crear (categoría sugerida), con selección múltiple.
   - **Sobran en la app**: registrados en el ciclo y ausentes del PDF (posible duplicado, pendiente aún no posteado o error): marcar, revertir o ignorar.
4. Diferencia de saldo: si tras aplicar sigue habiendo diferencia, ofrecer un ajuste (`ADJUSTMENT`) por el monto exacto.
5. Al confirmar: el corte queda con los datos importados (`STATEMENT_CLOSED`), los movimientos creados quedan `CONFIRMED` y vinculados al import.
6. Desde el correo: un correo de estado de cuenta con PDF adjunto se clasifica como `STATEMENT` y entra al mismo importador; aparece en pendientes como "Estado de cuenta listo para conciliar". Sin adjunto: solo el recordatorio actual.

## Back (`packages/finance`)

- Modelo nuevo `FinStatementImport`: `id, userId, cardId?, accountId?, statementId?, source (UPLOAD|EMAIL), emailMessageId?, status (PARSING|READY|APPLIED|FAILED|DISCARDED), parsed Json, error?, createdAt, appliedAt`. Ítems `FinStatementImportLine`: `importId, date, description, amount, currency, reference?, matchTransactionId?, decision (MATCH|CREATE|IGNORE)`.
- `POST /finance/cards/:id/statements/import` (multipart `file`, `password?`) → crea el import y procesa en background (outbox/job); devuelve `{ importId }`. Equivalente `POST /finance/accounts/:id/statements/import`.
- `GET /finance/statement-imports/:id` → estado, cabecera y líneas con la propuesta de match.
- `PATCH /finance/statement-imports/:id/lines/:lineId` → cambiar decisión / match.
- `POST /finance/statement-imports/:id/apply` → en una `$transaction`: crea movimientos, cierra/actualiza el corte, ajuste opcional. Idempotente.
- `DELETE /finance/statement-imports/:id` → descartar.
- Extracción: texto con `pdf-parse` (o `pdftotext`); PDFs con clave via `qpdf`/`pdfjs` con password; extractor LLM con el mismo puerto que `ai-email-transaction.extractor.ts` y esquema estricto. Fixtures anonimizados por banco en `test/fixtures/bank-statements/{bhd,popular,qik}/`.
- Matcher puro (`match-statement-lines.ts`) con specs: referencia > monto+fecha±3d+similitud de texto ≥ 0.8.
- Ingesta: outcome `STATEMENT` en la clasificación de correo; descargar el adjunto PDF con Gmail API y crear el import con `source=EMAIL`.
- Tool del agente `import_statement` (inicia desde un correo pendiente) y `get_statement_import`.
- No guardar el PDF tras el parseo (o guardarlo cifrado con retención corta); no loguear contenido.

## Web

- Botón en `card-statements-section.tsx` y en el detalle de cuenta.
- Hook `use-statement-import.ts` (subida, polling de estado con React Query).
- Vista `/finance/statement-imports/[importId]`: cabecera (periodo, saldo, mínimo, fecha límite), tres grupos con checkboxes, total de diferencia y CTA "Aplicar".
- Entrada desde pendientes de correo (`/finance/sync`).
- Errores en `finance-error-messages.ts` (`STATEMENT_PARSE_FAILED`, `STATEMENT_PASSWORD_REQUIRED`, `STATEMENT_ALREADY_APPLIED`).

## Criterios de aceptación

- [ ] Subir un PDF de BHD/Popular/Qik de prueba produce un import `READY` con líneas correctas.
- [ ] Coinciden / faltan / sobran se calculan bien (specs del matcher).
- [ ] Aplicar crea solo lo marcado, actualiza el corte y es idempotente.
- [ ] La diferencia final ofrece un ajuste exacto.
- [ ] Un correo con PDF de estado de cuenta crea un import desde pendientes.
- [ ] PDF con clave pide la clave y no la persiste.
- [ ] Migración sin drift; e2e del flujo upload → apply.

Depende de 04 (paginación de líneas si son muchas) y se beneficia de 07 (comercios para emparejar descripciones).
