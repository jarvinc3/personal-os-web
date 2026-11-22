import assert from "node:assert/strict"
import { describe, it } from "node:test"

import nextConfig from "../../next.config.mjs"
import {
  CONTENT_SECURITY_POLICY_HEADER,
  CSP_NONCE_HEADER,
  contentSecurityPolicy,
  createNonce,
  staticSecurityHeaders,
} from "./security-headers.mjs"

const TEST_NONCE = "dGVzdC1ub25jZQ=="

function directivesOf(policy: string): Map<string, string> {
  const directives = new Map<string, string>()
  for (const directive of policy.split("; ")) {
    const [name, ...values] = directive.split(" ")
    directives.set(name, values.join(" "))
  }
  return directives
}

describe("staticSecurityHeaders", () => {
  it("bloquea el marco y el sniffing de tipos", () => {
    const headers = new Map(
      staticSecurityHeaders({ isProduction: true }).map(({ key, value }) => [
        key,
        value,
      ])
    )

    assert.equal(headers.get("X-Frame-Options"), "DENY")
    assert.equal(headers.get("X-Content-Type-Options"), "nosniff")
    assert.equal(
      headers.get("Referrer-Policy"),
      "strict-origin-when-cross-origin"
    )
    assert.match(headers.get("Permissions-Policy") ?? "", /camera=\(\)/)
    assert.match(headers.get("Strict-Transport-Security") ?? "", /max-age=/)
  })

  it("no fija HSTS fuera de producción", () => {
    const keys = staticSecurityHeaders({ isProduction: false }).map(
      ({ key }) => key
    )

    assert.ok(!keys.includes("Strict-Transport-Security"))
  })
})

describe("next.config", () => {
  it("aplica la cabecera de marco a todas las rutas", () => {
    const rule = nextConfig.headers().find(({ source }) => source === "/(.*)")

    assert.ok(rule)
    assert.ok(
      rule.headers.some(
        ({ key, value }) => key === "X-Frame-Options" && value === "DENY"
      )
    )
  })
})

describe("contentSecurityPolicy", () => {
  it("usa las cabeceras que espera Next para el nonce", () => {
    assert.equal(CONTENT_SECURITY_POLICY_HEADER, "Content-Security-Policy")
    assert.equal(CSP_NONCE_HEADER, "x-nonce")
  })

  it("en producción exige nonce en los scripts y no permite el marco", () => {
    const policy = contentSecurityPolicy({
      nonce: TEST_NONCE,
      isDevelopment: false,
      apiUrl: "https://api.personal-os.test/api",
      supabaseUrl: "https://project.supabase.co",
      sentryDsn: "https://key@o1.ingest.sentry.io/2",
    })
    const directives = directivesOf(policy)

    assert.equal(directives.get("default-src"), "'self'")
    assert.equal(directives.get("script-src"), `'self' 'nonce-${TEST_NONCE}'`)
    assert.equal(directives.get("frame-ancestors"), "'none'")
    assert.equal(directives.get("frame-src"), "'none'")
    assert.equal(directives.has("upgrade-insecure-requests"), true)
  })

  it("conecta solo con los orígenes configurados, también por WebSocket", () => {
    const directives = directivesOf(
      contentSecurityPolicy({
        nonce: TEST_NONCE,
        isDevelopment: false,
        apiUrl: "https://api.personal-os.test/api",
        supabaseUrl: "https://project.supabase.co",
        sentryDsn: "https://key@o1.ingest.sentry.io/2",
      })
    )

    assert.equal(
      directives.get("connect-src"),
      "'self' https://api.personal-os.test wss://api.personal-os.test https://project.supabase.co https://o1.ingest.sentry.io"
    )
  })

  it("deja los estilos inline documentados y sin orígenes de más", () => {
    const directives = directivesOf(
      contentSecurityPolicy({ nonce: TEST_NONCE, isDevelopment: false })
    )

    assert.equal(directives.get("style-src"), "'self' 'unsafe-inline'")
    assert.equal(directives.get("connect-src"), "'self'")
    assert.equal(directives.get("script-src"), `'self' 'nonce-${TEST_NONCE}'`)
  })

  it("permite los orígenes de avatar que ya usa la app", () => {
    const directives = directivesOf(
      contentSecurityPolicy({ nonce: TEST_NONCE, isDevelopment: false })
    )
    const imgSources = (directives.get("img-src") ?? "").split(" ")

    assert.ok(imgSources.includes("https://www.gravatar.com"))
    assert.ok(imgSources.includes("https://*.googleusercontent.com"))
  })

  it("en preview permite la barra de Vercel sin abrir otros marcos", () => {
    const directives = directivesOf(
      contentSecurityPolicy({
        nonce: TEST_NONCE,
        isDevelopment: false,
        isVercelPreview: true,
      })
    )

    assert.match(directives.get("script-src") ?? "", /https:\/\/vercel\.live/)
    assert.match(
      directives.get("connect-src") ?? "",
      /wss:\/\/ws-us3\.pusher\.com/
    )
    assert.equal(directives.get("frame-src"), "https://vercel.live")
    assert.equal(directives.get("frame-ancestors"), "'none'")
  })

  it("en desarrollo permite eval y WebSocket para el recargado en caliente", () => {
    const directives = directivesOf(
      contentSecurityPolicy({ nonce: TEST_NONCE, isDevelopment: true })
    )

    assert.match(directives.get("script-src") ?? "", /'unsafe-eval'/)
    assert.match(
      directives.get("script-src") ?? "",
      /https:\/\/va\.vercel-scripts\.com/
    )
    assert.match(directives.get("connect-src") ?? "", /ws:/)
    assert.equal(directives.has("upgrade-insecure-requests"), false)
  })
})

describe("createNonce", () => {
  it("devuelve base64 distinto en cada petición", () => {
    const first = createNonce()
    const second = createNonce()

    assert.match(first, /^[A-Za-z0-9+/]+={0,2}$/)
    assert.notEqual(first, second)
  })
})
