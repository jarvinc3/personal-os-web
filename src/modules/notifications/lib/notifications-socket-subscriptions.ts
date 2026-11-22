export type NotificationsSocketHandler = (payload: unknown) => void

type SocketSubscriptionInput = {
  handlers: Map<string, Set<NotificationsSocketHandler>>
  socketRef: { current: Pick<SocketLike, "on" | "off"> | null }
  event: string
  handler: NotificationsSocketHandler
}

type SocketLike = {
  on(event: string, handler: NotificationsSocketHandler): void
  off(event: string, handler: NotificationsSocketHandler): void
}

export function addSocketSubscription({
  handlers,
  socketRef,
  event,
  handler,
}: SocketSubscriptionInput): () => void {
  let eventHandlers = handlers.get(event)
  if (!eventHandlers) {
    eventHandlers = new Set()
    handlers.set(event, eventHandlers)
  }
  eventHandlers.add(handler)
  socketRef.current?.on(event, handler)

  return () => {
    eventHandlers?.delete(handler)
    if (eventHandlers?.size === 0) {
      handlers.delete(event)
    }
    socketRef.current?.off(event, handler)
  }
}

export function attachSocketSubscriptions({
  handlers,
  socket,
}: {
  handlers: ReadonlyMap<string, ReadonlySet<NotificationsSocketHandler>>
  socket: SocketLike
}): void {
  for (const [event, eventHandlers] of handlers) {
    for (const handler of eventHandlers) {
      socket.on(event, handler)
    }
  }
}
