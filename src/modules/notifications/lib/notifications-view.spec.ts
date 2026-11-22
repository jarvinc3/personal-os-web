import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  countReadNotifications,
  countUnreadNotifications,
  notificationModuleFilter,
  notificationModuleOptions,
  notificationsForModule,
  notificationsForReadFilter,
} from "./notifications-view.ts"
import type { NotificationRecord } from "@/src/modules/notifications/types/notification.types"

function notification(
  id: string,
  overrides: Partial<NotificationRecord> = {}
): NotificationRecord {
  return {
    id,
    userId: "user-1",
    type: "TEST",
    channel: "IN_APP",
    title: `Aviso ${id}`,
    body: "",
    data: {},
    isRead: false,
    scheduledAt: null,
    sentAt: null,
    createdAt: "2026-11-22T00:00:00.000Z",
    ...overrides,
  }
}

const NOTIFICATIONS = [
  notification("1", { data: { moduleSlug: "finance" } }),
  notification("2", { data: { moduleSlug: "agenda" }, isRead: true }),
  notification("3", { data: { moduleSlug: "finance" }, isRead: true }),
  notification("4", { data: {} }),
]

describe("notificationModuleOptions", () => {
  it("lists the modules of the loaded notifications in registry order", () => {
    assert.deepEqual(notificationModuleOptions(NOTIFICATIONS), [
      "finance",
      "agenda",
    ])
  })
})

describe("notificationModuleFilter", () => {
  it("keeps the requested module only while it has notifications", () => {
    assert.equal(notificationModuleFilter("finance", ["finance"]), "finance")
    assert.equal(notificationModuleFilter("projects", ["finance"]), null)
    assert.equal(notificationModuleFilter(null, ["finance"]), null)
  })
})

describe("notificationsForModule", () => {
  it("filters by module and keeps everything without a filter", () => {
    assert.deepEqual(
      notificationsForModule(NOTIFICATIONS, "finance").map((item) => item.id),
      ["1", "3"]
    )
    assert.equal(notificationsForModule(NOTIFICATIONS, null).length, 4)
  })
})

describe("notificationsForReadFilter", () => {
  it("filters unread, read or all notifications", () => {
    assert.deepEqual(
      notificationsForReadFilter(NOTIFICATIONS, "unread").map(
        (item) => item.id
      ),
      ["1", "4"]
    )
    assert.deepEqual(
      notificationsForReadFilter(NOTIFICATIONS, "read").map((item) => item.id),
      ["2", "3"]
    )
    assert.equal(notificationsForReadFilter(NOTIFICATIONS, "all").length, 4)
  })
})

describe("notification counts", () => {
  it("counts each read state", () => {
    assert.equal(countUnreadNotifications(NOTIFICATIONS), 2)
    assert.equal(countReadNotifications(NOTIFICATIONS), 2)
  })
})
