export interface AppModule {
  id: string
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  status: "available" | "coming_soon" | "in_design"
  features: string[]
}

export const appModules: AppModule[] = [
  {
    id: "finance",
    name: "Finanzas",
    description:
      "Control total de tus cuentas, tarjetas y transacciones. La IA lee tus emails bancarios y categoriza cada gasto automáticamente.",
    icon: "💳",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    status: "available",
    features: [
      "Lectura automática de emails bancarios",
      "Categorización inteligente con IA",
      "Presupuestos y alertas de gasto",
      "Multi-moneda y tasas de cambio en tiempo real",
      "Detección de gastos recurrentes",
      "Reportes mensuales automáticos",
    ],
  },
  {
    id: "subscriptions",
    name: "Suscripciones",
    description:
      "Rastrea y gestiona todas tus suscripciones en un solo lugar. Nunca más olvides una renovación ni pagues por algo que no usas.",
    icon: "🔄",
    color: "text-violet-700",
    bgColor: "bg-violet-50 border-violet-200",
    status: "coming_soon",
    features: [
      "Registro de todas tus suscripciones",
      "Alertas de vencimiento y renovación",
      "Integración con módulo de finanzas",
      "Calendario de pagos automático",
      "Análisis de gastos por suscripción",
    ],
  },
  {
    id: "agenda",
    name: "Agenda",
    description:
      "Tu calendario inteligente que se conecta con tus proyectos, salud y suscripciones para darte una vista unificada de tu vida.",
    icon: "📅",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    status: "coming_soon",
    features: [
      "Calendario unificado de todas las áreas",
      "Citas médicas y rutinas de salud",
      "Tareas de proyectos con fecha",
      "Alertas de vencimiento de suscripciones",
      "Vista semanal y mensual",
    ],
  },
  {
    id: "projects",
    name: "Proyectos",
    description:
      "Gestión de proyectos personales y profesionales con seguimiento de presupuesto integrado y vinculación con tu agenda.",
    icon: "🚀",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    status: "coming_soon",
    features: [
      "Tablero de proyectos y tareas",
      "Presupuesto integrado con finanzas",
      "Tareas con fecha en la agenda",
      "Seguimiento de progreso",
      "Notas y archivos por proyecto",
    ],
  },
  {
    id: "health",
    name: "Salud",
    description:
      "Monitorea tu alimentación, rutinas de ejercicio y citas médicas. Tu agente IA analiza patrones y sugiere mejoras.",
    icon: "❤️",
    color: "text-rose-700",
    bgColor: "bg-rose-50 border-rose-200",
    status: "coming_soon",
    features: [
      "Registro de alimentación y nutrición",
      "Rutinas de ejercicio y progreso",
      "Citas médicas en la agenda",
      "Análisis de hábitos con IA",
      "Recordatorios de medicamentos",
    ],
  },
]

export const appFeatures = [
  {
    icon: "🤖",
    title: "Agente IA Central",
    description:
      "Un asistente inteligente con memoria persistente que conoce todas las áreas de tu vida y puede ejecutar acciones reales.",
  },
  {
    icon: "⚡",
    title: "Automatización Real",
    description:
      "Captura datos automáticamente desde emails bancarios, APIs y fuentes externas. Menos entrada manual, más inteligencia.",
  },
  {
    icon: "🔗",
    title: "Módulos Interconectados",
    description:
      "Cada módulo es independiente pero comparte datos con los demás. Una suscripción genera una transacción. Una tarea aparece en tu agenda.",
  },
  {
    icon: "📱",
    title: "Mobile First",
    description:
      "Diseñado desde cero para tu celular. Notificaciones push inteligentes que te mantienen al tanto sin interrumpirte.",
  },
  {
    icon: "🔐",
    title: "Privacidad y Seguridad",
    description:
      "Tokens OAuth2 encriptados con AES-256. Acceso de solo lectura a emails. Tus datos nunca se venden ni comparten.",
  },
  {
    icon: "🌐",
    title: "Multi-moneda",
    description:
      "Soporte nativo para múltiples monedas con tasas de cambio en tiempo real. Perfecto para quien maneja DOP, USD y más.",
  },
]
