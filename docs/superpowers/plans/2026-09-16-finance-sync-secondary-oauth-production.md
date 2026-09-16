# Finance Sync Secondary OAuth Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir Sincronización en una vista secundaria y evitar que una configuración OAuth de producción vuelva a apuntar a `localhost` o a un callback inexistente.

**Architecture:** La web seguirá construyendo un `returnTo` controlado, pero validará explícitamente su origen en producción. Las rutas de sync usarán el patrón existente `usePageHeader` y el contenedor dejará de sobrescribir su encabezado. El backend validará al arrancar que CORS y el callback financiero sean seguros y coherentes para producción.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node test runner, NestJS 11, Zod 4, Jest.

## Global Constraints

- El origen web de producción es `https://personal-os-web-one.vercel.app`.
- El callback de producción es `https://personal-os-back-production.up.railway.app/api/finance/email-sync/oauth/google/callback`.
- `/finance/sync` y `/finance/sync/oauth` son vistas secundarias.
- El botón Atrás de ambas vistas navega siempre a `/finance/accounts`.
- No se añadirá compatibilidad con `/api/auth/google/callback`.
- Producción no aceptará `localhost`, `127.0.0.1` ni HTTP como origen web.
- No registrar códigos OAuth, tokens ni el JWT completo de `state`.

---

### Task 1: Validar el origen OAuth del frontend

**Files:**
- Modify: `src/modules/finance/lib/gmail-oauth.ts`
- Test: `src/modules/finance/lib/gmail-oauth.spec.ts`

**Interfaces:**
- Produces: `resolveFinanceAppOrigin(raw: string | undefined, nodeEnv: string | undefined): string`
- Consumes: `NEXT_PUBLIC_URL` y `NODE_ENV` desde `financeAppOrigin()`.

- [ ] **Step 1: Escribir pruebas fallidas de producción**

Agregar al bloque `describe("Gmail OAuth returnTo", ...)`:

```ts
import * as gmailOAuth from "./gmail-oauth.ts"

type GmailOAuthModule = {
  resolveFinanceAppOrigin?: (
    raw: string | undefined,
    nodeEnv: string | undefined,
  ) => string
}

it("requires the canonical HTTPS web origin in production", () => {
  const resolveFinanceAppOrigin = (gmailOAuth as GmailOAuthModule)
    .resolveFinanceAppOrigin
  assert.equal(typeof resolveFinanceAppOrigin, "function")
  assert.throws(
    () => resolveFinanceAppOrigin!(undefined, "production"),
    /NEXT_PUBLIC_URL is required in production/,
  )
  assert.throws(
    () =>
      resolveFinanceAppOrigin!("http://localhost:3000", "production"),
    /NEXT_PUBLIC_URL must be an HTTPS non-local origin in production/,
  )
  assert.equal(
    resolveFinanceAppOrigin!(
      "https://personal-os-web-one.vercel.app/path",
      "production",
    ),
    "https://personal-os-web-one.vercel.app",
  )
})
```

Añadir el import de namespace y el tipo junto a los imports existentes.

- [ ] **Step 2: Ejecutar la prueba y comprobar RED**

Run:

```bash
pnpm test -- src/modules/finance/lib/gmail-oauth.spec.ts
```

Expected: FAIL con `undefined !== "function"` porque
`resolveFinanceAppOrigin` todavía no está exportada.

- [ ] **Step 3: Implementar la resolución segura**

En `gmail-oauth.ts`, extraer la lógica:

```ts
export function resolveFinanceAppOrigin(
  raw: string | undefined,
  nodeEnv: string | undefined,
): string {
  const value = raw?.trim()
  if (!value && nodeEnv === "production") {
    throw new Error("NEXT_PUBLIC_URL is required in production")
  }

  const candidate = value || FALLBACK_APP_URL
  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    if (nodeEnv === "production") {
      throw new Error("NEXT_PUBLIC_URL must be a valid URL in production")
    }
    return new URL(FALLBACK_APP_URL).origin
  }

  const local =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "::1"
  if (nodeEnv === "production" && (url.protocol !== "https:" || local)) {
    throw new Error(
      "NEXT_PUBLIC_URL must be an HTTPS non-local origin in production",
    )
  }
  return url.origin
}

export function financeAppOrigin(): string {
  return resolveFinanceAppOrigin(
    process.env.NEXT_PUBLIC_URL,
    process.env.NODE_ENV,
  )
}
```

- [ ] **Step 4: Verificar GREEN y regresión**

Run:

```bash
pnpm test -- src/modules/finance/lib/gmail-oauth.spec.ts
pnpm typecheck
```

Expected: todas las pruebas PASS y TypeScript termina con código 0.

- [ ] **Step 5: Commit**

```bash
git add src/modules/finance/lib/gmail-oauth.ts src/modules/finance/lib/gmail-oauth.spec.ts
git commit -m "fix(finance): reject invalid production OAuth origin"
```

---

### Task 2: Convertir las rutas de sync en vistas secundarias

**Files:**
- Create: `src/modules/finance/lib/finance-navigation.ts`
- Create: `src/modules/finance/lib/finance-navigation.spec.ts`
- Modify: `src/modules/finance/components/layout/finance-authenticated-page.tsx`
- Modify: `src/modules/finance/pages/finance-sync.tsx`
- Modify: `src/modules/finance/pages/finance-sync-oauth.tsx`

**Interfaces:**
- Produces: `isFinanceSecondaryRoute(pathname: string): boolean`
- Consumes: `usePageHeader`, `APP_ROUTES.app.financeAccounts` y `router.push`.

- [ ] **Step 1: Escribir la prueba fallida de clasificación**

Crear `finance-navigation.spec.ts`:

```ts
import assert from "node:assert/strict"
import { describe, it } from "node:test"

type NavigationModule = {
  isFinanceSecondaryRoute?: (pathname: string) => boolean
}

const navigation = (await import("./finance-navigation.ts").catch(
  () => ({}),
)) as NavigationModule

describe("isFinanceSecondaryRoute", () => {
  it("classifies sync and account detail routes as secondary", () => {
    assert.equal(navigation.isFinanceSecondaryRoute?.("/finance/sync"), true)
    assert.equal(
      navigation.isFinanceSecondaryRoute?.("/finance/sync/oauth"),
      true,
    )
    assert.equal(
      navigation.isFinanceSecondaryRoute?.(
        "/finance/accounts/institutions/institution-1",
      ),
      true,
    )
    assert.equal(navigation.isFinanceSecondaryRoute?.("/finance/accounts"), false)
  })
})
```

- [ ] **Step 2: Ejecutar la prueba y comprobar RED**

Run:

```bash
pnpm test -- src/modules/finance/lib/finance-navigation.spec.ts
```

Expected: FAIL con `undefined !== true`, porque el módulo todavía no existe.

- [ ] **Step 3: Crear el clasificador mínimo**

Crear `finance-navigation.ts`:

```ts
import { APP_ROUTES } from "../../../shared/constants/app-routes.ts"

export function isFinanceSecondaryRoute(pathname: string): boolean {
  return (
    pathname === APP_ROUTES.app.financeCategories ||
    pathname === APP_ROUTES.app.financeSync ||
    pathname.startsWith(`${APP_ROUTES.app.financeSync}/`) ||
    pathname.startsWith(`${APP_ROUTES.app.financeAccounts}/institutions/`) ||
    pathname.startsWith(`${APP_ROUTES.app.financeAccounts}/cash/`)
  )
}
```

- [ ] **Step 4: Evitar que el contenedor sobrescriba el header**

En `finance-authenticated-page.tsx`, eliminar `isFinanceAccountsDetail`, importar
`isFinanceSecondaryRoute` y reemplazar `accountsDetail` por:

```ts
const secondaryRoute = isFinanceSecondaryRoute(pathname)
```

Usar `secondaryRoute` en ambos efectos existentes para no establecer ni
restablecer el header primario mientras una vista secundaria está montada.

- [ ] **Step 5: Configurar `/finance/sync`**

En `finance-sync.tsx`, importar `APP_ROUTES`, `usePageHeader`, `useRouter`,
`useCallback`; dentro de `FinanceSyncCatalog`:

```ts
const router = useRouter()
const handleBack = useCallback(() => {
  router.push(APP_ROUTES.app.financeAccounts)
}, [router])

usePageHeader(
  {
    variant: "secondary",
    title: "Sincronización",
    onBack: handleBack,
  },
  [handleBack],
)
```

- [ ] **Step 6: Configurar `/finance/sync/oauth`**

En `finance-sync-oauth.tsx`, importar `usePageHeader`, `useRouter` y
`useCallback`; dentro de `FinanceSyncOAuthResult`:

```ts
const router = useRouter()
const handleBack = useCallback(() => {
  router.push(APP_ROUTES.app.financeAccounts)
}, [router])

usePageHeader(
  {
    variant: "secondary",
    title: "Conectar Gmail",
    onBack: handleBack,
  },
  [handleBack],
)
```

- [ ] **Step 7: Verificar GREEN, lint y tipos**

Run:

```bash
pnpm test -- src/modules/finance/lib/finance-navigation.spec.ts
pnpm lint -- src/modules/finance/lib/finance-navigation.ts src/modules/finance/lib/finance-navigation.spec.ts src/modules/finance/components/layout/finance-authenticated-page.tsx src/modules/finance/pages/finance-sync.tsx src/modules/finance/pages/finance-sync-oauth.tsx
pnpm typecheck
```

Expected: prueba PASS, ESLint y TypeScript terminan con código 0.

- [ ] **Step 8: Commit**

```bash
git add src/modules/finance/lib/finance-navigation.ts src/modules/finance/lib/finance-navigation.spec.ts src/modules/finance/components/layout/finance-authenticated-page.tsx src/modules/finance/pages/finance-sync.tsx src/modules/finance/pages/finance-sync-oauth.tsx
git commit -m "feat(finance): present sync as secondary flow"
```

---

### Task 3: Rechazar configuración OAuth insegura en el backend

**Files:**
- Modify: `../personal-os-back/src/config/env.schema.ts`
- Modify: `../personal-os-back/src/config/env.schema.spec.ts`
- Modify: `../personal-os-back/docs/operations/environment.md`

**Interfaces:**
- Consumes: `NODE_ENV`, `API_PREFIX`, `CORS_ORIGIN`, `GOOGLE_REDIRECT_URI`.
- Produces: validación de arranque para HTTPS no local y callback financiero.

- [ ] **Step 1: Escribir pruebas fallidas del entorno de producción**

En `env.schema.spec.ts`, crear:

```ts
const validProductionEnv: Record<string, unknown> = {
  ...validBaseEnv,
  NODE_ENV: "production",
  REDIS_URL: "redis://localhost:6379",
  OAUTH_STATE_SECRET: "test-oauth-state-secret-minimum-32-chars",
  CORS_ORIGIN: "https://personal-os-web-one.vercel.app",
  GOOGLE_REDIRECT_URI:
    "https://personal-os-back-production.up.railway.app/api/finance/email-sync/oauth/google/callback",
}
```

Agregar:

```ts
describe("envSchema production OAuth", () => {
  it("accepts the canonical production OAuth configuration", () => {
    expect(parseEnv(validProductionEnv).GOOGLE_REDIRECT_URI).toContain(
      "/api/finance/email-sync/oauth/google/callback",
    )
  })

  it("rejects local or HTTP CORS origins in production", () => {
    expect(() =>
      parseEnv({
        ...validProductionEnv,
        CORS_ORIGIN: "http://localhost:3000",
      }),
    ).toThrow(/CORS_ORIGIN must contain only HTTPS non-local origins in production/)
  })

  it("rejects the obsolete Google callback path in production", () => {
    expect(() =>
      parseEnv({
        ...validProductionEnv,
        GOOGLE_REDIRECT_URI:
          "https://personal-os-back-production.up.railway.app/api/auth/google/callback",
      }),
    ).toThrow(
      /GOOGLE_REDIRECT_URI must use the finance email sync callback path/,
    )
  })
})
```

- [ ] **Step 2: Ejecutar las pruebas y comprobar RED**

Run:

```bash
pnpm test -- src/config/env.schema.spec.ts --runInBand
```

Expected: las dos pruebas de rechazo FAIL porque hoy ambas configuraciones son
aceptadas.

- [ ] **Step 3: Implementar validaciones de producción**

Dentro de `envSchema.superRefine`, antes de validar proveedores de IA:

```ts
if (data.NODE_ENV === "production") {
  const corsOrigins = data.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => new URL(origin))
  const hasUnsafeOrigin = corsOrigins.some(
    (url) =>
      url.protocol !== "https:" ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1",
  )
  if (hasUnsafeOrigin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "CORS_ORIGIN must contain only HTTPS non-local origins in production",
      path: ["CORS_ORIGIN"],
    })
  }

  const redirect = new URL(data.GOOGLE_REDIRECT_URI)
  const expectedPath = `/${data.API_PREFIX}/finance/email-sync/oauth/google/callback`
  if (redirect.protocol !== "https:" || redirect.pathname !== expectedPath) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "GOOGLE_REDIRECT_URI must use the finance email sync callback path over HTTPS",
      path: ["GOOGLE_REDIRECT_URI"],
    })
  }
}
```

- [ ] **Step 4: Documentar los valores canónicos**

Añadir a `docs/operations/environment.md`:

```md
Producción:

- `CORS_ORIGIN=https://personal-os-web-one.vercel.app`
- `GOOGLE_REDIRECT_URI=https://personal-os-back-production.up.railway.app/api/finance/email-sync/oauth/google/callback`
- No incluir `localhost` en `CORS_ORIGIN`.
- Registrar exactamente `GOOGLE_REDIRECT_URI` en Google Cloud.
```

- [ ] **Step 5: Verificar backend**

Run:

```bash
pnpm test -- src/config/env.schema.spec.ts --runInBand
pnpm lint -- src/config/env.schema.ts src/config/env.schema.spec.ts
pnpm build
```

Expected: Jest PASS, ESLint sin errores y build Nest exitoso.

- [ ] **Step 6: Commit**

```bash
git add src/config/env.schema.ts src/config/env.schema.spec.ts docs/operations/environment.md
git commit -m "fix(config): validate production Gmail OAuth URLs"
```

---

### Task 4: Configurar y verificar producción

**Files:**
- Modify: `docs/operations/runbook.md`

**Interfaces:**
- Consumes: despliegues Vercel/Railway y cliente OAuth de Google Cloud.
- Produces: flujo completo Google → Railway → Vercel.

- [ ] **Step 1: Actualizar el runbook web**

Añadir a `docs/operations/runbook.md`:

```md
### Gmail OAuth en producción

1. Vercel: `NEXT_PUBLIC_URL=https://personal-os-web-one.vercel.app`.
2. Railway: `CORS_ORIGIN=https://personal-os-web-one.vercel.app`.
3. Railway:
   `GOOGLE_REDIRECT_URI=https://personal-os-back-production.up.railway.app/api/finance/email-sync/oauth/google/callback`.
4. Google Cloud Authorized redirect URI: el mismo valor de
   `GOOGLE_REDIRECT_URI`.
5. Redesplegar backend y frontend; iniciar una autorización nueva.
```

- [ ] **Step 2: Configurar Google Cloud**

En el cliente OAuth usado por `GOOGLE_CLIENT_ID`, añadir exactamente:

```text
https://personal-os-back-production.up.railway.app/api/finance/email-sync/oauth/google/callback
```

Eliminar `/api/auth/google/callback`; el repositorio confirma que el único
callback Gmail implementado es el endpoint financiero.

- [ ] **Step 3: Configurar Railway**

Establecer:

```text
CORS_ORIGIN=https://personal-os-web-one.vercel.app
GOOGLE_REDIRECT_URI=https://personal-os-back-production.up.railway.app/api/finance/email-sync/oauth/google/callback
```

Crear un despliegue nuevo y confirmar que el backend arranca sin errores de
validación.

- [ ] **Step 4: Configurar Vercel**

Establecer para Production:

```text
NEXT_PUBLIC_URL=https://personal-os-web-one.vercel.app
```

Crear un despliegue nuevo, ya que `NEXT_PUBLIC_*` queda incorporada durante el
build.

- [ ] **Step 5: Verificar el flujo desde el teléfono**

1. Abrir `/finance/accounts`.
2. Entrar a una institución y abrir Sincronización.
3. Confirmar header secundario, ausencia de tab bar y Atrás → Cuentas.
4. Conectar Gmail e inspeccionar que Google use el callback financiero.
5. Tras consentir, confirmar `302` hacia
   `https://personal-os-web-one.vercel.app/finance/sync/oauth`.
6. Confirmar el mensaje de éxito, abrir Sincronización y ejecutar un sync.

Expected: no aparece JSON 404, ninguna URL contiene `localhost` y la fuente de
Gmail queda conectada.

- [ ] **Step 6: Commit del runbook**

```bash
git add docs/operations/runbook.md
git commit -m "docs(finance): document production Gmail OAuth setup"
```

---

### Task 5: Verificación final

**Files:**
- Verify only.

**Interfaces:**
- Consumes: los entregables de Tasks 1–4.
- Produces: evidencia de que ambos repositorios están listos para desplegar.

- [ ] **Step 1: Ejecutar la suite web**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: todos los comandos terminan con código 0.

- [ ] **Step 2: Ejecutar la suite backend**

Run desde `../personal-os-back`:

```bash
pnpm test -- --runInBand
pnpm lint
pnpm build
```

Expected: todos los comandos terminan con código 0.

- [ ] **Step 3: Comprobar diffs y secretos**

Run en cada repositorio:

```bash
git diff --check
git status --short
```

Expected: sin errores de whitespace; únicamente cambios esperados y ningún
archivo `.env` preparado para commit.
