export type NotificationsSocketHandler = (payload: unknown) => void

type SocketLike = {
  on(event: string, handler: NotificationsSocketHandler): void
  off(event: string, handler: NotificationsSocketHandler): void
}

export type NotificationsSocketSubscriptions = {
  subscribe: (event: string, handler: NotificationsSocketHandler) => () => void
  attach: (socket: SocketLike) => void
}

/**
 * El registro vive con el proveedor: guarda los handlers por evento y los
 * vuelve a enganchar cuando cambia el socket. La baja usa el socket activo,
 * no una copia vieja.
 */
export function createNotificationsSocketSubscriptions(): NotificationsSocketSubscriptions {
  const handlersByEvent = new Map<string, Set<NotificationsSocketHandler>>()
  let activeSocket: SocketLike | null = null

  const subscribe = (event: string, handler: NotificationsSocketHandler) => {
    let handlers = handlersByEvent.get(event)
    if (!handlers) {
      handlers = new Set()
      handlersByEvent.set(event, handlers)
    }
    handlers.add(handler)
    activeSocket?.on(event, handler)

    return () => {
      handlers?.delete(handler)
      if (handlers?.size === 0) {
        handlersByEvent.delete(event)
      }
      activeSocket?.off(event, handler)
    }
  }

  const attach = (socket: SocketLike) => {
    activeSocket = socket
    for (const [event, handlers] of handlersByEvent) {
      for (const handler of handlers) {
        socket.on(event, handler)
      }
    }
  }

  return { subscribe, attach }
}
