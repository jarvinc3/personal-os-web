# Fase 08: Ingesta de correo y deduplicación

## Objetivo
Un mismo hecho bancario produce **un** movimiento, aunque llegue en varios correos. En particular, no deben duplicarse los reversos.

## Reglas de negocio
1. **R1:** clave de idempotencia fuerte: `(userId, institutionId, externalReference)`, con un índice único parcial cuando `externalReference IS NOT NULL`. Si al crear choca, el correo queda `SKIPPED_DUPLICATE` y se enlaza al movimiento existente (`FinEmailMessage.duplicateOfTransactionId`).
2. **R2:** huella (`fingerprint`) = sha256 del `from`, el asunto y el cuerpo normalizados (sin espacios repetidos, sin fechas de envío ni pies de página). Es única por `sourceId`, y si se repite → `SKIPPED_DUPLICATE` antes de llamar al LLM, lo que además ahorra costo.
3. **R3:** reversos (`resolve-reverse-original.ts` + `process-gmail-sync.use-case.ts`): antes de revertir, si ya existe un movimiento con `linkedTransactionId = original.id` **o** el original ya está `REVERSED` → `SKIPPED_DUPLICATE`. Además, dentro de la `$transaction` del reverso, hacer un `SELECT … FOR UPDATE` sobre el original.
4. **R4:** fusión de autorización y liquidación: si llega un `CONFIRMED` con el mismo destino, monto (±1%) y comercio parecido (similitud ≥ 0.8) que un `PENDING` de hace 10 días o menos, se **actualiza** ese `PENDING` a `CONFIRMED` (con el monto final) en vez de crear uno nuevo.
5. **R5:** posible duplicado (búsqueda aproximada): mismo destino, misma moneda y monto exacto, ±48 h, comercio con similitud ≥ 0.8 y sin referencia → se crea igual, pero con `possibleDuplicateOfId`. La UI muestra "¿Duplicado?" con "Unir" o "No es duplicado".
6. **R6:** `POST /transactions/:id/merge { intoId }`: borra el duplicado vía el diario y conserva el otro.

## Esquema Prisma
```prisma
model FinTransaction {
  // + nuevos
  institutionId         String? @map("institution_id") // denormalizado para el índice; se llena desde la cuenta o tarjeta
  possibleDuplicateOfId String? @map("possible_duplicate_of_id")
}
model FinEmailMessage {
  // + nuevos
  fingerprint              String? 
  duplicateOfTransactionId String? @map("duplicate_of_transaction_id")
  @@unique([sourceId, fingerprint], map: "fin_email_messages_source_fingerprint_key")
}
```
Índice parcial, escrito en SQL a mano dentro de la migración:
```sql
CREATE UNIQUE INDEX IF NOT EXISTS fin_transactions_user_inst_ref_key
  ON fin_transactions(user_id, institution_id, external_reference)
  WHERE external_reference IS NOT NULL AND status <> 'REVERSED';
```

## Migración de datos (de riesgo)
1. Llenar `institution_id` desde `fin_accounts` o `fin_cards`.
2. **Antes de crear el índice**, detectar los duplicados que ya existen:
   ```sql
   SELECT user_id, institution_id, external_reference, array_agg(id ORDER BY created_at)
   FROM fin_transactions WHERE external_reference IS NOT NULL
   GROUP BY 1,2,3 HAVING count(*) > 1;
   ```
3. El script `scripts/finance/dedupe-existing.ts` (con `--dry-run`) conserva el más antiguo y borra el resto vía el diario (fase 09), con compensación de saldo.
4. Detectar los reversos duplicados: `SELECT linked_transaction_id, count(*) FROM fin_transactions WHERE linked_transaction_id IS NOT NULL GROUP BY 1 HAVING count(*)>1;` y resolverlos igual.

## API
- `GET /transactions?possibleDuplicates=true` (con cursor).
- `POST /transactions/:id/merge`.
- `POST /transactions/:id/not-duplicate`, que limpia `possibleDuplicateOfId`.

## Web
- Badge "¿Duplicado?" en la fila y en el detalle, con las dos acciones.
- En `/finance/sync`, contador de duplicados evitados (`SKIPPED_DUPLICATE`).

## Móvil y agente IA
- **Móvil:** solo campos nuevos opcionales.
- **Agente:** tool `list_possible_duplicates`.

## Tests
- **Unit:**
  - dos correos con el mismo reverso → un solo reverso (R3);
  - la misma referencia → `SKIPPED_DUPLICATE`;
  - huella idéntica → no se llama al extractor;
  - fusión de una autorización con su liquidación (R4).
- **e2e:** sincronización simulada con 2 correos duplicados.

## Criterios de aceptación
- Reprocesar el mismo buzón no crea movimientos nuevos.
- No hay dos reversos del mismo original.

## Riesgos
- **El índice falla** si quedan duplicados: el paso 2 es obligatorio.
- **La fusión R4 puede unir dos compras reales iguales:** por eso aplicarla solo con `PENDING` y una ventana corta.
