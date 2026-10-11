export function getActionStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pendiente"
    case "SUCCESS":
      return "Aplicada"
    case "CANCELLED":
      return "Cancelada"
    case "FAILED":
      return "Fallida"
    case "RUNNING":
      return "En progreso"
    default:
      return status
  }
}

export function getActionConfirmationMessage(status: string): string | null {
  switch (status) {
    case "SUCCESS":
      return "Acción aplicada correctamente."
    case "CANCELLED":
      return "Acción cancelada."
    case "FAILED":
      return "No se pudo completar la acción."
    default:
      return null
  }
}
