# Seguridad

## Cómo reportar

No abras un issue con los detalles. Escribe a jarvinct3@gmail.com o usa un aviso privado desde la pestaña **Security** del repositorio.

Incluye lo siguiente:

- qué componente falla: cliente web, API, autenticación o ingesta de correo;
- pasos para reproducirlo;
- impacto que observas: datos expuestos, sesión tomada, dinero movido;
- versión o commit donde lo viste.

## Alcance

Interesan especialmente el bypass de sesión o de RLS, la exposición de tokens de Supabase, la inyección en la API, el acceso a datos de otro usuario y cualquier fallo del ledger que mueva dinero.

## Fuera de alcance

- Dependencias desactualizadas sin una ruta de explotación concreta.
- Reportes automáticos de escáneres sin pasos reproducibles.
