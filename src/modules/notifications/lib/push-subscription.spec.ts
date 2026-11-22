import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  serializePushSubscription,
  urlBase64ToUint8Array,
} from "./push-subscription.ts"

describe("urlBase64ToUint8Array", () => {
  it("decodifica base64 estándar", () => {
    assert.deepEqual([...urlBase64ToUint8Array("AQID")], [1, 2, 3])
  })

  it("acepta el alfabeto de URL y agrega el relleno que falta", () => {
    assert.deepEqual([...urlBase64ToUint8Array("-_8")], [251, 255])
  })

  it("decodifica una clave con relleno", () => {
    assert.deepEqual([...urlBase64ToUint8Array("AQIDBA==")], [1, 2, 3, 4])
  })
})

describe("serializePushSubscription", () => {
  it("serializa la suscripción como JSON", () => {
    const subscription = {
      toJSON: () => ({
        endpoint: "https://push.test/x",
        keys: { p256dh: "a" },
      }),
    } as unknown as PushSubscription

    assert.equal(
      serializePushSubscription(subscription),
      '{"endpoint":"https://push.test/x","keys":{"p256dh":"a"}}'
    )
  })
})
