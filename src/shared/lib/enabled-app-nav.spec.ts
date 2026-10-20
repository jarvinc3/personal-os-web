import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { enabledAppEntries } from "./enabled-app-nav.ts"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"

describe("enabledAppEntries", () => {
  it("keeps the registry order no matter the order of the enabled list", () => {
    const entries = enabledAppEntries(["health", "finance", "agenda"])
    assert.deepEqual(
      entries.map((entry) => entry.slug),
      ["finance", "agenda", "health"]
    )
  })

  it("leaves out the apps the user did not enable", () => {
    const entries = enabledAppEntries(["finance"])
    assert.deepEqual(
      entries.map((entry) => entry.slug),
      ["finance"]
    )
  })

  it("never lists Keep Awake as an app of the user", () => {
    const entries = enabledAppEntries(["keepAwake", "projects"])
    assert.deepEqual(
      entries.map((entry) => entry.slug),
      ["projects"]
    )
  })

  it("returns nothing when no app is enabled", () => {
    assert.deepEqual(enabledAppEntries([]), [])
  })

  it("labels and links every app from the registry and its route", () => {
    const [projects] = enabledAppEntries(["projects"])
    assert.equal(projects.label, "Proyectos")
    assert.equal(projects.href, APP_ROUTES.app.projects)
  })
})
