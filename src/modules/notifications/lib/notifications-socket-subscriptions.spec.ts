import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  addSocketSubscription,
  attachSocketSubscriptions,
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

function createSocketRef<T>(socket: T | null) {
  return { current: socket }
}

describe("addSocketSubscription", () => {
  it("registers the handler for its event and removes it on unsubscribe", () => {
    const fake = createFakeSocket()
    const handlers = new Map<string, Set<NotificationsSocketHandler>>()
    const socketRef = createSocketRef(fake.socket)
    const handler = () => {}

    const unsubscribe = addSocketSubscription({
      handlers,
      socketRef,
      event: "notification.created",
      handler,
    })

    assert.deepEqual(fake.calls, ["on:notification.created"])
    assert.equal(handlers.get("notification.created")?.has(handler), true)

    unsubscribe()

    assert.deepEqual(fake.calls, [
      "on:notification.created",
      "off:notification.created",
    ])
    assert.equal(handlers.has("notification.created"), false)
  })

  it("keeps the event while another handler still listens", () => {
    const fake = createFakeSocket()
    const handlers = new Map<string, Set<NotificationsSocketHandler>>()
    const socketRef = createSocketRef(fake.socket)
    const first = () => {}
    const second = () => {}

    const unsubscribeFirst = addSocketSubscription({
      handlers,
      socketRef,
      event: "notification.created",
      handler: first,
    })
    addSocketSubscription({
      handlers,
      socketRef,
      event: "notification.created",
      handler: second,
    })

    unsubscribeFirst()

    assert.equal(handlers.get("notification.created")?.size, 1)
    assert.equal(handlers.get("notification.created")?.has(second), true)
  })

  it("removes from the current socket when it was replaced", () => {
    const first = createFakeSocket()
    const second = createFakeSocket()
    const handlers = new Map<string, Set<NotificationsSocketHandler>>()
    const socketRef = createSocketRef(first.socket)
    const handler = () => {}

    const unsubscribe = addSocketSubscription({
      handlers,
      socketRef,
      event: "ai.email.sync.updated",
      handler,
    })
    socketRef.current = second.socket
    unsubscribe()

    assert.deepEqual(first.calls, ["on:ai.email.sync.updated"])
    assert.deepEqual(second.calls, ["off:ai.email.sync.updated"])
  })
})

describe("attachSocketSubscriptions", () => {
  it("replays every registered handler on a new socket", () => {
    const fake = createFakeSocket()
    const first = () => {}
    const second = () => {}
    const handlers = new Map<string, Set<NotificationsSocketHandler>>([
      ["notification.created", new Set([first])],
      ["ai.email.sync.updated", new Set([second])],
    ])

    attachSocketSubscriptions({ handlers, socket: fake.socket })

    assert.deepEqual(fake.calls, [
      "on:notification.created",
      "on:ai.email.sync.updated",
    ])
    assert.equal(fake.registered.get("notification.created")?.has(first), true)
    assert.equal(
      fake.registered.get("ai.email.sync.updated")?.has(second),
      true
    )
  })
})
