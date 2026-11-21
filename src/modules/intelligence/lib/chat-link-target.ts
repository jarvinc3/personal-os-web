const EXTERNAL_PROTOCOLS = new Set(["http:", "https:"])
const MAIL_PROTOCOL = "mailto:"

export type ChatLinkTarget =
  | { kind: "app"; href: string }
  | { kind: "external"; href: string }
  | { kind: "mail"; href: string }
  | { kind: "text" }

/**
 * Una ruta de la app empieza por una sola barra. Con `//` el navegador lee un
 * anfitrión y con `\` hace lo mismo, porque lo convierte en barra.
 */
function isAppPath(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")
}

/**
 * Destino que corresponde a un enlace escrito por el agente. Solo las rutas de
 * la app, `http`, `https` y `mailto` se convierten en enlaces; un esquema como
 * `javascript:` o `data:` se pinta como texto y no se puede pulsar.
 */
export function resolveChatLinkTarget(url: string): ChatLinkTarget {
  if (isAppPath(url)) {
    return { kind: "app", href: url }
  }

  if (!URL.canParse(url)) {
    return { kind: "text" }
  }

  const protocol = new URL(url).protocol
  if (protocol === MAIL_PROTOCOL) {
    return { kind: "mail", href: url }
  }

  if (EXTERNAL_PROTOCOLS.has(protocol)) {
    return { kind: "external", href: url }
  }

  return { kind: "text" }
}
