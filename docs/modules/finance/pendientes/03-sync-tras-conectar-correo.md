# 03 · Ofrecer sincronización automática al conectar el correo

## Problema

Al terminar el OAuth de Gmail, la web vuelve a `/finance/sync` con el sheet `oauth-gmail-result` (`oauth-gmail-result-sheet.tsx`), que solo informa el resultado. Activar la sincronización automática y su horario solo se puede en Ajustes → Finanzas (`emailSync.automatic`, `emailSync.schedule`). Verificado: el sheet no ofrece ese paso.

## Comportamiento esperado

Tras un OAuth exitoso, el sheet tiene un segundo paso:

1. "¿Sincronizar automáticamente?" (toggle, encendido por defecto si `emailSync.automatic` está apagado).
2. Horario: chips "Cada 15 min", "Cada hora", "Cada 6 h" o "Horas fijas" (selector de horas, pasos de 5 min).
3. Modo de importación: "Confirmar directo" (`DIRECT`) o "Dejar pendiente para revisar" (`PENDING`).
4. "Sincronizar ahora" opcional (lanza la primera sincronización).
5. Si ya estaba configurado, el paso muestra el resumen y "Cambiar" (no vuelve a preguntar).

## Back

Sin cambios: el ajuste vive en `UserModule.config.emailSync` (mínimo 15 min) y `gmail-auto-sync.scheduler.ts` lo respeta. Usar el endpoint actual de configuración de módulo y el de sincronización manual.

## Web

- `oauth-gmail-result-sheet.tsx`: paso 2 con el formulario; reutilizar los campos de `finance-module-settings-form.tsx` (extraer un componente `EmailSyncScheduleFields`).
- Guardar con la misma mutación de settings; invalidar la query de configuración.
- Spec de la lógica de defaults (`finance-module-form.ts`).

## Criterios de aceptación

- [x] Tras conectar Gmail aparece el paso de sincronización automática.
- [x] Guardar actualiza `emailSync` y se refleja en Ajustes → Finanzas.
- [x] "Sincronizar ahora" lanza la sync y muestra el progreso/resultado.
- [x] Con la sync ya configurada solo se muestra el resumen.
