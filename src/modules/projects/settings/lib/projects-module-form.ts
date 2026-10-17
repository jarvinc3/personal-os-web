import { z } from "zod"

export const projectsModuleSchema = z.object({
  defaultView: z.enum(["board", "list", "timeline"]),
  sortDirection: z.enum(["asc", "desc"]),
  showArchived: z.boolean(),
  dueDateReminders: z.boolean(),
  statusChanges: z.boolean(),
})

export type ProjectsModuleFormValues = z.infer<typeof projectsModuleSchema>
