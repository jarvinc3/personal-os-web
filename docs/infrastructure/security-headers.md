# Cabeceras de seguridad

La app autenticada se protege del clickjacking y de scripts inline no previstos con una CSP estricta con nonce por petición y cabeceras anti-incrustación.

## Dónde vive cada cosa

| Cabecera                    | Dónde             | Valor                                                               |
| --------------------------- | ----------------- | ------------------------------------------------------------------- |
| `Content-Security-Policy`   | `proxy.ts`        | Política con nonce por petición; ver abajo                          |
| `X-Frame-Options`           | `next.config.mjs` | `DENY`                                                              |
| `X-Content-Type-Options`    | `next.config.mjs` | `nosniff`                                                           |
| `Referrer-Policy`           | `next.config.mjs` | `strict-origin-when-cross-origin`                                   |
| `Permissions-Policy`        | `next.config.mjs` | `camera=(), geolocation=(), microphone=(), payment=(), usb=()`      |
| `Strict-Transport-Security` | `next.config.mjs` | `max-age=63072000; includeSubDomains`, solo en builds de producción |

Las cabeceras fijas salen de `src/config/security-headers.mjs`, que importa `next.config.mjs`. La CSP se arma en el mismo módulo, pero la aplica `proxy.ts`: el nonce cambia en cada petición y no puede vivir en la configuración del build.

## CSP

- `default-src 'self'`; `frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'none'`; `form-action 'self'`.
- `script-src 'self' 'nonce-<n>'`: Next lee el nonce de la cabecera `Content-Security-Policy` de la petición y lo pone en sus scripts; `app/layout.tsx` se lo pasa al script de apariencia y a `next-themes`. Sin `'unsafe-inline'` ni `'strict-dynamic'`; los scripts de Vercel Analytics y los chunks de Sentry cargan del propio origen.
- `connect-src` toma del entorno el API (también por `wss`, que usa socket.io), Supabase y el origen del DSN de Sentry. `img-src` suma Supabase, `img.logo.dev` y `flagcdn.com`.
- En desarrollo se agregan `'unsafe-eval'` y `ws:` para el recargado en caliente de Turbopack. Producción agrega `upgrade-insecure-requests`.
- En las previews de Vercel (`VERCEL_ENV=preview`) se permiten los orígenes de su barra (`vercel.live` y su WebSocket) y el marco de la barra, porque la inyecta en cada carga; sin eso la consola muestra una violación. Producción y desarrollo no los permiten.

## Coste: todas las rutas son dinámicas

El layout raíz lee `headers()` para obtener el nonce. Eso impide prerenderizar cualquier ruta: el build deja de generar estáticos y cada petición se renderiza en el servidor. Es el precio de que `script-src` no necesite `'unsafe-inline'`; se aceptó al implementar #500.

## Excepciones documentadas

- `style-src 'self' 'unsafe-inline'`: framer-motion escribe atributos `style` y `chart.tsx` inyecta un `<style>` con variables por gráfico; no se pueden hashear. Los scripts siguen exigiendo nonce, que es la vía de XSS que importa.

## Cómo comprobarlo

```bash
curl -sI https://<preview>/login | grep -i "content-security-policy\|x-frame-options"
```

En el navegador, la consola no debe mostrar «Refused to execute inline script» ni errores de `connect-src` al cargar la app, al abrir Ajustes → Apariencia, al ver un gráfico y al iniciar sesión.

## Al agregar un origen o un script

- Un endpoint nuevo del API o de tiempo real: se deriva de `NEXT_PUBLIC_API_URL`; no hace falta tocar nada.
- Un tercer origen (CDN, analítica, imágenes): se agrega en `contentSecurityPolicy` con su prueba en `src/config/security-headers.spec.ts`.
- Un script inline nuevo: recibe el nonce del layout o de la cabecera `x-nonce`; nunca `'unsafe-inline'`.
