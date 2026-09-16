# Sincronización financiera secundaria y OAuth de producción

## Objetivo

Presentar la sincronización de correo como una vista secundaria de Finanzas y
corregir el retorno de Google OAuth en producción.

## Navegación

- `/finance/sync` usará el encabezado secundario con el título
  `Sincronización`.
- El botón Atrás navegará siempre a `/finance/accounts`, incluso al entrar por
  URL directa o regresar desde OAuth.
- La barra principal de secciones de Finanzas permanecerá oculta porque
  `ModuleSectionLayout` ya la oculta para encabezados secundarios.
- `/finance/sync/oauth` será también una vista secundaria, con el título
  `Conectar Gmail` y retorno estable a `/finance/accounts`.
- El resultado OAuth conservará su acción actual: después de una conexión
  exitosa permite continuar a Sincronización; ante un fallo permite regresar al
  destino seguro.

## Configuración OAuth

El frontend, el backend y Google Cloud deben compartir valores coherentes:

- `NEXT_PUBLIC_URL` será el origen HTTPS real de `personal-os-web`.
- `CORS_ORIGIN` del backend incluirá exactamente ese origen.
- `GOOGLE_REDIRECT_URI` será
  `https://personal-os-back-production.up.railway.app/api/finance/email-sync/oauth/google/callback`.
- La URI anterior se registrará como Authorized redirect URI del cliente OAuth
  en Google Cloud.

No se añadirá compatibilidad con `/api/auth/google/callback`: es una ruta
obsoleta, los intentos OAuth duran pocos minutos y los usuarios pueden iniciar
uno nuevo después del despliegue.

## Flujo

1. La web construye `returnTo` desde `NEXT_PUBLIC_URL`.
2. El backend acepta ese origen únicamente si está incluido en `CORS_ORIGIN`.
3. Google retorna al endpoint financiero configurado en
   `GOOGLE_REDIRECT_URI`.
4. El backend procesa el código y redirige a
   `{NEXT_PUBLIC_URL}/finance/sync/oauth`.
5. La vista muestra el resultado y permite continuar sin exponer una ruta
   principal incorrecta.

## Errores y seguridad

- Un `returnTo` fuera de `CORS_ORIGIN` seguirá rechazándose para evitar open
  redirects.
- No se aceptará `localhost` dentro de los orígenes de producción.
- No se registrarán códigos de autorización, tokens ni el JWT completo de
  `state`.
- Tras cambiar variables de entorno se crearán nuevos despliegues del frontend
  y backend; los intentos OAuth iniciados antes del cambio se descartarán.

## Verificación

- Prueba de navegación: Sincronización configura encabezado secundario, título
  correcto y retorno a Cuentas.
- Prueba equivalente para la página de resultado OAuth.
- Pruebas existentes de construcción y allowlist de `returnTo`.
- En producción, inspeccionar una autorización nueva y confirmar que:
  - `redirect_uri` apunta al callback financiero de Railway;
  - `state.returnTo` usa el dominio HTTPS real de la web;
  - Google retorna al backend y este responde con un `302` hacia la web;
  - la conexión queda visible y puede iniciar una sincronización.
