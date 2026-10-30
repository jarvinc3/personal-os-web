"use client"

import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import { resolveNotificationsSocketUrl } from "@/src/modules/notifications/lib/notifications-socket-url"
import { useAppStore } from "@/src/shared/store/app-store"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { io, type Socket } from "socket.io-client"

export type NotificationsSocketStatus =
  "connecting" | "connected" | "disconnected"

type NotificationsSocketHandler = (payload: unknown) => void

type NotificationsSocketContextValue = {
  status: NotificationsSocketStatus
  subscribe: (event: string, handler: NotificationsSocketHandler) => () => void
}

const NotificationsSocketContext =
  createContext<NotificationsSocketContextValue | null>(null)

function updateSocketAuth(socket: Socket, token: string) {
  socket.auth = { token }
}

export function NotificationsSocketProvider({
  children,
}: {
  children: ReactNode
}) {
  const userId = useAppStore((state) => state.session?.userId ?? null)
  const token = useAppStore((state) => state.session?.token ?? null)
  const [status, setStatus] = useState<NotificationsSocketStatus>("connecting")
  const socketRef = useRef<Socket | null>(null)
  const socketUserIdRef = useRef<string | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const tokenRef = useRef<string | null>(token)
  const handlersRef = useRef(new Map<string, Set<NotificationsSocketHandler>>())

  const reconnectWithFreshToken = useCallback(async (socket: Socket) => {
    try {
      const { data, error } =
        await getSupabaseBrowserClient().auth.refreshSession()
      if (error || !data.session?.access_token) {
        setStatus("disconnected")
        return
      }
      updateSocketAuth(socket, data.session.access_token)
      setStatus("connecting")
      socket.connect()
    } catch {
      setStatus("disconnected")
    }
  }, [])

  const createSocket = useCallback(() => {
    const socket = io(`${resolveNotificationsSocketUrl()}/notifications`, {
      auth: { token: tokenRef.current },
      transports: ["websocket"],
    })

    for (const [event, handlers] of handlersRef.current) {
      for (const handler of handlers) {
        socket.on(event, handler)
      }
    }

    socket.on("connect", () => {
      reconnectAttemptsRef.current = 0
      setStatus("connected")
    })
    socket.on("disconnect", (reason) => {
      if (socketRef.current !== socket) {
        return
      }
      setStatus("disconnected")
      if (
        reason === "io server disconnect" &&
        reconnectAttemptsRef.current < 3
      ) {
        reconnectAttemptsRef.current += 1
        void reconnectWithFreshToken(socket)
      }
    })
    socket.on("connect_error", () => setStatus("disconnected"))
    socket.io.on("reconnect_attempt", () => setStatus("connecting"))

    return socket
  }, [reconnectWithFreshToken])

  const subscribe = useCallback(
    (event: string, handler: NotificationsSocketHandler) => {
      let handlers = handlersRef.current.get(event)
      if (!handlers) {
        handlers = new Set()
        handlersRef.current.set(event, handlers)
      }
      handlers.add(handler)
      socketRef.current?.on(event, handler)

      return () => {
        handlers?.delete(handler)
        if (handlers?.size === 0) {
          handlersRef.current.delete(event)
        }
        socketRef.current?.off(event, handler)
      }
    },
    []
  )

  useEffect(() => {
    tokenRef.current = token
    if (!userId || !token) {
      socketRef.current?.disconnect()
      socketRef.current = null
      socketUserIdRef.current = null
      return
    }

    if (socketUserIdRef.current !== userId) {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
    const socket = socketRef.current ?? createSocket()
    socketRef.current = socket
    socketUserIdRef.current = userId
    updateSocketAuth(socket, token)
    if (socket.disconnected && !socket.active) {
      socket.connect()
    }
  }, [createSocket, token, userId])

  useEffect(
    () => () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    },
    []
  )

  const visibleStatus = !userId || !token ? "disconnected" : status
  const value = useMemo(
    () => ({ status: visibleStatus, subscribe }),
    [subscribe, visibleStatus]
  )

  return (
    <NotificationsSocketContext.Provider value={value}>
      {children}
    </NotificationsSocketContext.Provider>
  )
}

function useNotificationsSocketContext() {
  const context = useContext(NotificationsSocketContext)
  if (!context) {
    throw new Error(
      "El canal de notificaciones necesita NotificationsSocketProvider."
    )
  }
  return context
}

export function useNotificationsSocketStatus() {
  return useNotificationsSocketContext().status
}

export function useNotificationsSocketEvent<TPayload>(
  event: string,
  handler: (payload: TPayload) => void
) {
  const { subscribe } = useNotificationsSocketContext()
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(
    () =>
      subscribe(event, (payload) => {
        handlerRef.current(payload as TPayload)
      }),
    [event, subscribe]
  )
}
