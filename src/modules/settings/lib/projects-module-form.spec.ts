import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { projectsModuleSchema } from "./projects-module-form.ts"

const validProjects = {
  defaultView: "board" as const,
  sortDirection: "asc" as const,
  showArchived: false,
  dueDateReminders: true,
  statusChanges: true,
}

describe("projectsModuleSchema", () => {
  it("accepts a valid projects config", () => {
    assert.equal(projectsModuleSchema.safeParse(validProjects).success, true)
  })

  it("rejects an unknown default view", () => {
    assert.equal(
      projectsModuleSchema.safeParse({ ...validProjects, defaultView: "gantt" })
        .success,
      false
    )
  })
})
