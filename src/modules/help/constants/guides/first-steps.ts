import type { HelpGuide } from "@/src/modules/help/types/help.types"

export const FIRST_STEPS_GUIDES: readonly HelpGuide[] = [
  {
    slug: "primeros-pasos",
    title: "Primeros pasos",
    summary: "De la cuenta nueva a tu primer movimiento registrado.",
    group: "primeros-pasos",
    steps: [
      {
        title: "Crea tu cuenta",
        body: "Regístrate con tu correo o entra con Google. Si usas correo, abre el mensaje de verificación antes de iniciar sesión.",
      },
      {
        title: "Completa tu perfil",
        body: "En Ajustes → Perfil y cuenta agrega tu nombre y tu foto.",
      },
      {
        title: "Elige tu región",
        body: "En Ajustes → Preferencias regionales ajusta la zona horaria, el idioma, la moneda y el primer día de la semana. Las fechas y los montos siguen esa elección.",
      },
      {
        title: "Activa tus apps",
        body: "En Ajustes → Apps enciende Finanzas, Agenda, Salud o Proyectos. Solo las apps activas aparecen en el menú.",
      },
      {
        title: "Crea una institución y una cuenta",
        body: "En Finanzas → Productos agrega el banco y la cuenta donde tienes el dinero. La institución de [[efectivo|efectivo]] ya viene creada.",
      },
      {
        title: "Registra tu primer movimiento",
        body: "Toca crear y elige Gasto o Ingreso. Completa categoría, monto, cuenta y fecha. Si te equivocas, edítalo antes de confirmarlo.",
      },
    ],
  },
]
