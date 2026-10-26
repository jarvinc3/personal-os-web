# Inteligencia

AI-2 ofrece una vista privada de Gmail, detalle de mensajes con representaciones cruda, saneada y canónica, consentimiento revocable y administración de roles `USER`, `CONTRIBUTOR` y `ADMIN`. AI-3 agrega particiones deterministas de `EMAIL_V1`, una cola paginada para etiquetar y verificar correo, marcas de verdad de referencia para HOLDOUT, historial de runs y procedencia visible en el detalle. La vista resume el estado y rango de fechas del bootstrap en badges, y agrupa correo, revisión y análisis en pestañas; la lista de mensajes empieza por los más antiguos.

La autorización OAuth solicita acceso de solo lectura. La ruta `/intelligence` y la administración se protegen con sesión; el backend aplica el rol ADMIN para los endpoints de gestión. El consentimiento de contribución es independiente de conectar Gmail y se puede cambiar en **Ajustes → Privacidad y datos**.

**API dueña del contrato:** [AI Email Intelligence](../../../../personal-os-back/docs/modules/ai-agent/capabilities/email-intelligence.md).

**Dataset, evidencia y verificación:** [AI-3](../../../../personal-os-back/docs/modules/ai-agent/capabilities/evidence-review.md).

En **Revisión → Revisar**, el tipo se elige entre los trece valores del contrato del backend con nombres en español. Los dominios son cuatro chips de selección múltiple; ninguno marcado envía `routes: []`. Transacción pide `kind` y muestra sus datos opcionales; Recibo / factura y Cobro de suscripción permiten añadir esos datos sin `kind`. Otros tipos no muestran ese bloque. Otro exige nota; Alerta de seguridad y Código de verificación fijan su relevancia. El detalle traduce las etiquetas y muestra «Sin dominios» cuando la lista está vacía.

El formulario de Revisar vive en un panel por ruta (`?sheet=intelligence-review&sheetId=<id>`), no dentro de la fila: la cola no se mueve al abrirlo y el asunto se lee en dos líneas sin que la etiqueta de partición lo tape. El panel muestra la vista previa del correo —cuerpo saneado y la sección «Cruda» plegada— al lado del formulario desde `md` y arriba en móvil. Cada correo lleva un ID corto (`#3f9a1c7e`) en la cola y en el detalle para distinguir dos con el mismo asunto, remitente y minuto. Al enviar la verificación, la fila sale de la cola en el acto y vuelve si el servidor rechaza el envío. El detalle muestra la Relevancia corregida junto al resto de etiquetas.

La cabecera de la vista deja la cola a la vista: Gmail y las insignias de cobertura viven en una sección plegada que resume la cuenta y el estado de la sincronización en una línea.

**Código:** `src/modules/intelligence/`, `app/(app)/intelligence/`.
