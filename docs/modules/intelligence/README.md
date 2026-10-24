# Inteligencia

La fase AI-2 ofrece una vista privada de Gmail, un detalle de mensajes con representaciones cruda, saneada y canónica, y ajustes para revocar la contribución al conocimiento global. El acceso de administración permite cambiar roles `USER`, `CONTRIBUTOR` y `ADMIN`.

La autorización OAuth solicita acceso de solo lectura. La ruta `/intelligence` y la administración se protegen con sesión; el backend aplica el rol ADMIN para los endpoints de gestión. El consentimiento de contribución es independiente de conectar Gmail y se puede cambiar en **Ajustes → Privacidad y datos**.

**API dueña del contrato:** [AI Email Intelligence](../../../../personal-os-back/docs/modules/ai-agent/capabilities/email-intelligence.md).

**Código:** `src/modules/intelligence/`, `app/(app)/intelligence/`.
