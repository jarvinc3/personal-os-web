import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  createNotificationsSocketSubscriptions,
  type NotificationsSocketHandler,
} from "./notifications-socket-subscriptions.ts"

function createFakeSocket() {
  const registered = new Map<string, Set<NotificationsSocketHandler>>()
  const calls: string[] = []

  return {
    calls,
    registered,
    socket: {
      on(event: string, handler: NotificationsSocketHandler) {
        calls.push(`on:${event}`)
        const handlers = registered.get(event) ?? new Set()
        handlers.add(handler)
        registered.set(event, handlers)
      },
      off(event: string, handler: NotificationsSocketHandler) {
        calls.push(`off:${event}`)
        registered.get(event)?.delete(handler)
      },
    },
  }
}

describe("createNotificationsSocketSubscriptions", () => {
  it("registers the handler for its event and removes it on unsubscribe", () => {
    const fake = createFakeSocket()
    const subscriptions = createNotificationsSocketSubscriptions()
    const handler = () => {}
    subscriptions.attach(fake.socket)

    const unsubscribe = subscriptions.subscribe("notification.created", handler)

    assert.deepEqual(fake.calls, ["on:notification.created"])
    assert.equal(
      fake.registered.get("notification.created")?.has(handler),
      true
    )

    unsubscribe()

    assert.deepEqual(fake.calls, [
      "on:notification.created",
      "off:notification.created",
    ])
    assert.equal(fake.registered.get("notification.created")?.size ?? 0, 0)
  })

  it("keeps the event while another handler still listens", () => {
    const fake = createFakeSocket()
    const subscriptions = createNotificationsSocketSubscriptions()
    const first = () => {}
    const second = () => {}
    subscriptions.attach(fake.socket)

    const unsubscribeFirst = subscriptions.subscribe(
      "notification.created",
      first
    )
    subscriptions.subscribe("notification.created", second)

    unsubscribeFirst()

    assert.equal(fake.registered.get("notification.created")?.size, 1)
    assert.equal(fake.registered.get("notification.created")?.has(second), true)
  })

  it("removes from the current socket when it was replaced", () => {
    const first = createFakeSocket()
    const second = createFakeSocket()
    const subscriptions = createNotificationsSocketSubscriptions()
    const handler = () => {}

    subscriptions.attach(first.socket)
    const unsubscribe = subscriptions.subscribe(
      "ai.email.sync.updated",
      handler
    )
    subscriptions.attach(second.socket)
    unsubscribe()

    assert.deepEqual(first.calls, ["on:ai.email.sync.updated"])
    assert.deepEqual(second.calls, [
      "on:ai.email.sync.updated",
      "off:ai.email.sync.updated",
    ])
  })

  it("forgets the event when its last handler leaves", () => {
    const fake = createFakeSocket()
    const subscriptions = createNotificationsSocketSubscriptions()
    const handler = () => {}
    const nextSocket = createFakeSocket()

    subscriptions.attach(fake.socket)
    subscriptions.subscribe("notification.created", handler)()
    subscriptions.attach(nextSocket.socket)

    assert.deepEqual(nextSocket.calls, [])
  })
})

describe("attach", () => {
  it("replays every registered handler on a new socket", () => {
    const first = createFakeSocket()
    const second = createFakeSocket()
    const subscriptions = createNotificationsSocketSubscriptions()
    const notificationHandler = () => {}
    const syncHandler = () => {}

    subscriptions.attach(first.socket)
    subscriptions.subscribe("notification.created", notificationHandler)
    subscriptions.subscribe("ai.email.sync.updated", syncHandler)
    subscriptions.attach(second.socket)

    assert.deepEqual(second.calls, [
      "on:notification.created",
      "on:ai.email.sync.updated",
    ])
    assert.equal(
      second.registered.get("notification.created")?.has(notificationHandler),
      true
    )
    assert.equal(
      second.registered.get("ai.email.sync.updated")?.has(syncHandler),
      true
    )
  })
})
