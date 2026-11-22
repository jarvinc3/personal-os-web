import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  resolveDevicePushRow,
  resolvePushDeviceRowState,
  type DevicePushRow,
  type PushRegistrationError,
  type WebPushPermissionStatus,
} from "./device-push-row.ts"

function row({
  permissionStatus,
  pushToken = null,
  isRequesting = false,
  registrationError = null,
}: {
  permissionStatus: WebPushPermissionStatus
  pushToken?: string | null
  isRequesting?: boolean
  registrationError?: PushRegistrationError
}): DevicePushRow {
  return resolveDevicePushRow({
    permissionStatus,
    pushToken,
    isRequesting,
    registrationError,
  })
}

describe("resolvePushDeviceRowState", () => {
  it("keeps the order between an active token and a registration error", () => {
    assert.equal(
      resolvePushDeviceRowState({
        permissionStatus: "granted",
        pushToken: "token",
        registrationError: "vapid-not-configured",
      }),
      "active"
    )
    assert.equal(
      resolvePushDeviceRowState({
        permissionStatus: "granted",
        pushToken: null,
        registrationError: "vapid-not-configured",
      }),
      "vapid-not-configured"
    )
    assert.equal(
      resolvePushDeviceRowState({
        permissionStatus: "granted",
        pushToken: null,
        registrationError: null,
      }),
      "retry-registration"
    )
    assert.equal(
      resolvePushDeviceRowState({
        permissionStatus: "default",
        pushToken: null,
        registrationError: null,
      }),
      "request"
    )
  })
})

describe("resolveDevicePushRow", () => {
  it("describes a browser without push support", () => {
    assert.deepEqual(row({ permissionStatus: "unsupported" }), {
      state: "unsupported",
      value: "No compatible con este navegador",
      disabled: true,
      showChevron: false,
    })
  })

  it("shows an active registration without a chevron", () => {
    assert.deepEqual(row({ permissionStatus: "granted", pushToken: "token" }), {
      state: "active",
      value: "Activo",
      disabled: true,
      showChevron: false,
    })
  })

  it("explains a missing VAPID key and keeps the row pressable", () => {
    assert.deepEqual(
      row({
        permissionStatus: "granted",
        registrationError: "vapid-not-configured",
      }),
      {
        state: "vapid-not-configured",
        value: "VAPID no configurado",
        disabled: false,
        showChevron: true,
      }
    )
  })

  it("disables the row when the push service is unavailable", () => {
    assert.deepEqual(
      row({
        permissionStatus: "granted",
        registrationError: "push-service-unavailable",
      }),
      {
        state: "service-unavailable",
        value: "Servicio push no disponible",
        disabled: true,
        showChevron: false,
      }
    )
  })

  it("offers a retry while the token registers", () => {
    assert.deepEqual(row({ permissionStatus: "granted", isRequesting: true }), {
      state: "retry-registration",
      value: "Registrando...",
      disabled: true,
      showChevron: true,
    })
    assert.equal(
      row({ permissionStatus: "granted" }).value,
      "Reintentar registro"
    )
  })

  it("keeps the denied permission pressable", () => {
    assert.deepEqual(row({ permissionStatus: "denied" }), {
      state: "denied",
      value: "Permiso denegado",
      disabled: false,
      showChevron: true,
    })
  })

  it("asks for the browser permission and names the wait", () => {
    assert.deepEqual(row({ permissionStatus: "default" }), {
      state: "request",
      value: "Activar en el navegador",
      disabled: false,
      showChevron: true,
    })
    assert.deepEqual(row({ permissionStatus: "default", isRequesting: true }), {
      state: "request",
      value: "Solicitando...",
      disabled: true,
      showChevron: true,
    })
  })
})
