export const siteInfo = {
  name: "Personal OS",
  description:
    "Personal OS centraliza y automatiza la gestión de tus finanzas, agenda, proyectos, salud y suscripciones en una sola app potenciada por inteligencia artificial.",
  url: "https://personal-os.app",
  email: "hola@personal-os.app",
  legalEmail: "legal@personal-os.app",
  privacyEmail: "privacidad@personal-os.app",
  keywords: [
    "personal os",
    "gestión personal",
    "finanzas personales",
    "agente IA",
    "productividad",
    "automatización",
    "agenda",
    "suscripciones",
  ],
  author: "Personal OS",
  statusBadge: "En desarrollo activo",
  copyright: `© ${new Date().getFullYear()} Personal OS. Todos los derechos reservados.`,
};

export const landingContent = {
  nav: {
    logoText: "Personal OS",
    cta: "Unirse a la lista",
    mobileCta: "Unirse a la lista de espera",
    links: [
      { href: "/#features", label: "Características" },
      { href: "/#modules", label: "Módulos" },
      { href: "/#ai", label: "IA" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contacto" },
    ],
  },
  hero: {
    badge: "En desarrollo activo",
    titleStart: "Tu vida,",
    titleHighlight: "centralizada",
    description:
      "Finanzas, agenda, proyectos y salud en un solo lugar. Un agente inteligente que trabaja para ti y te ahorra horas cada semana.",
    primaryCta: "Lista de espera",
    secondaryCta: "Ver características",
    stats: [
      { value: "5+", label: "Módulos integrados" },
      { value: "<$1", label: "USD/mes en IA" },
      { value: "100%", label: "Privado y seguro" },
    ],
    mockup: {
      message:
        "Detecté un gasto de RD$3,200 en Supermercado Nacional. Lo categoricé como Alimentación. Tu presupuesto de comida está al 78% este mes.",
      highlight: "Alimentación",
      agentName: "Agente Personal OS",
      status: "Escribiendo...",
    },
  },
  features: {
    badge: "Características",
    title: "Diseñado para la vida real",
    description:
      "No es otra app de productividad. Es una plataforma que automatiza lo repetitivo para que puedas enfocarte en lo que importa.",
  },
  modules: {
    badge: "Módulos",
    titleStart: "Todo lo que necesitas,",
    titleHighlight: "en un solo lugar",
    description:
      "Cada módulo es independiente pero están interconectados. Una suscripción puede generar una transacción. Una tarea puede aparecer en tu agenda.",
    comingSoonNote:
      "💡 Este módulo está en roadmap. Únete a la lista de espera para ser notificado cuando esté disponible.",
    labels: {
      available: "Disponible",
      in_design: "En diseño",
      coming_soon: "Próximamente",
    },
  },
  ai: {
    badge: "Inteligencia Artificial",
    titleStart: "Un agente que",
    titleHighlight: "actúa por ti",
    description:
      "No es un chatbot. Es un agente central con acceso a todos tus módulos y memoria persistente que recuerda quién eres.",
    capabilities: [
      {
        title: "Conversación natural",
        description:
          "Habla con tu agente como si fuera un asistente personal. Pregunta, delega, ordena.",
        example: '"¿Cuánto gasté en entretenimiento este mes?"',
        icon: "💬",
      },
      {
        title: "Acciones reales",
        description:
          "No solo responde — actúa. Puede crear transacciones, agendar eventos y crear tareas.",
        example: '"Crea un gasto de RD$500 en gasolina"',
        icon: "⚡",
      },
      {
        title: "Sugerencias proactivas",
        description:
          "El agente analiza tus patrones y te avisa cuando detecta algo importante.",
        example: '"Tu gasto en delivery subió 40% vs el mes pasado"',
        icon: "🔔",
      },
      {
        title: "Memoria persistente",
        description:
          "Recuerda tu contexto entre sesiones. Con el tiempo te conoce mejor.",
        example: '"Como de costumbre, categoricé esto como Alimentación"',
        icon: "🧠",
      },
    ],
    chatDemo: {
      agentName: "Agente Personal OS",
      status: "En línea",
      messages: [
        {
          role: "user",
          text: "¿Cuánto gasté en comida este mes?",
        },
        {
          role: "assistant",
          text: "Este mes (mayo) llevas RD$18,450 en Alimentación — eso es el 82% de tu presupuesto mensual de RD$22,500. Los gastos más frecuentes son en Supermercado Nacional (5 visitas) y Uber Eats (8 pedidos). ¿Quieres que te muestre el desglose detallado?",
        },
        {
          role: "user",
          text: "Sí, muéstrame el desglose",
        },
        {
          role: "assistant",
          text: "Supermercado Nacional: RD$8,200 · Uber Eats: RD$5,100 · Restaurantes: RD$3,200 · Panadería La Fe: RD$1,950. ¡Tu gasto en delivery subió 35% vs abril! ¿Quiero que ajuste el presupuesto para el próximo mes?",
        },
      ],
      placeholder: "Escribe un mensaje...",
    },
    costNote: {
      stats: [
        { value: "< $1", label: "USD/mes en IA" },
        { value: "~500", label: "tokens por mensaje" },
        { value: "$0.003", label: "USD por interacción" },
      ],
      description:
        "Modelos rotativos (Groq, Cerebras, OpenRouter) para mantener costos al mínimo sin sacrificar calidad.",
    },
  },
  waitlist: {
    badge: "Plazas limitadas en beta",
    title: "Sé el primero en usarlo",
    description:
      "Únete a la lista de espera y recibe acceso anticipado a la beta, novedades exclusivas y precios de lanzamiento especiales.",
    successTitle: "¡Estás en la lista!",
    successMessage: "Te avisaremos cuando tengamos acceso disponible para ti.",
    inputPlaceholder: "tu@email.com",
    buttonDefault: "Unirme ahora",
    buttonLoading: "Enviando...",
    footerNote: "Sin spam. Sin tarjeta de crédito. Cancela cuando quieras.",
    trustBadges: [
      { emoji: "🔐", text: "100% privado" },
      { emoji: "🚀", text: "Acceso beta anticipado" },
      { emoji: "🎁", text: "Precio de lanzamiento" },
    ],
  },
  footer: {
    description:
      "Tu sistema operativo personal. Centraliza y automatiza la gestión de todas las áreas de tu vida con inteligencia artificial integrada.",
    columns: [
      {
        title: "Producto",
        links: [
          { href: "/#features", label: "Características" },
          { href: "/#modules", label: "Módulos" },
          { href: "/#ai", label: "Agente IA" },
          { href: "/#waitlist", label: "Lista de espera" },
        ],
      },
      {
        title: "Soporte",
        links: [
          { href: "/faq", label: "Preguntas frecuentes" },
          { href: "/contact", label: "Contacto" },
        ],
      },
      {
        title: "Legal",
        links: [
          { href: "/privacy", label: "Política de privacidad" },
          { href: "/terms", label: "Términos y condiciones" },
        ],
      },
    ],
  },
};
