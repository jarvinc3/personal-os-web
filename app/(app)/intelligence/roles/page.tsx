import { redirect } from "next/navigation"

import { APP_ROUTES } from "@/src/shared/constants/app-routes"

/** `/intelligence/roles` siempre existió con el nombre viejo: lleva a la ruta real. */
export default function IntelligenceRolesRoute() {
  redirect(APP_ROUTES.app.intelligenceAdminRoles)
}
