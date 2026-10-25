# Inteligencia

AI-2 ofrece una vista privada de Gmail, detalle de mensajes con representaciones cruda, saneada y canónica, consentimiento revocable y administración de roles `USER`, `CONTRIBUTOR` y `ADMIN`. AI-3 agrega particiones deterministas de `EMAIL_V1`, una cola paginada para etiquetar y verificar correo, marcas de verdad de referencia para HOLDOUT, historial de runs y procedencia visible en el detalle. La vista resume el estado y rango de fechas del bootstrap en badges, y agrupa correo, revisión y análisis en pestañas; la lista de mensajes empieza por los más antiguos.

La autorización OAuth solicita acceso de solo lectura. La ruta `/intelligence` y la administración se protegen con sesión; el backend aplica el rol ADMIN para los endpoints de gestión. El consentimiento de contribución es independiente de conectar Gmail y se puede cambiar en **Ajustes → Privacidad y datos**.

**API dueña del contrato:** [AI Email Intelligence](../../../../personal-os-back/docs/modules/ai-agent/capabilities/email-intelligence.md).

**Dataset, evidencia y verificación:** [AI-3](../../../../personal-os-back/docs/modules/ai-agent/capabilities/evidence-review.md).

**Código:** `src/modules/intelligence/`, `app/(app)/intelligence/`.
