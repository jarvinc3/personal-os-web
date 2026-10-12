# Keep Awake — reglas

Sin endpoints. Persistencia local.

| ID           | Condición                     | Resultado                                                                 | Evidencia              |
| ------------ | ----------------------------- | ------------------------------------------------------------------------- | ---------------------- |
| `BR-KAW-001` | Navegar dentro de `(app)`     | El Wake Lock **no** se suelta (`KeepAwakeProvider` en el layout)          | `app/(app)/layout.tsx` |
| `BR-KAW-002` | Otra tab reclama ownership    | `BroadcastChannel` `personal-os-keep-awake`; history `tab_yielded`        | `session-storage.ts`   |
| `BR-KAW-003` | Temporizador llega a `endsAt` | Auto-stop + toast + history `countdown_finished`                          | `wake-lock-session.ts` |
| `BR-KAW-004` | Tab hidden durante activo     | Fase `interrupted` (no pause de usuario); elapsed sigue                   | `session-status.ts`    |
| `BR-KAW-005` | Reminder dispara              | Clock local; ventana 5 min; **nunca** pide Wake Lock solo; sheet floating | `reminders.ts`         |
