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
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
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
