export type NotificationRecord = {
  id: string
  userId: string
  type: string
  channel: "IN_APP" | "PUSH" | "EMAIL"
  title: string
  body: string
  data: Record<string, unknown>
  isRead: boolean
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
}

export type PaginatedNotifications = {
  items: NotificationRecord[]
  nextCursor: string | null
  hasMore: boolean
}

export type UnreadCountResponse = {
  count: number
}

export type NotificationSocketPayload = {
  id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown>
  createdAt: string
}

/** Which read state the list is showing. */
export type NotificationReadFilter = "all" | "unread" | "read"
