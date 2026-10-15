export interface FAQItem {
  question: string
  answer: string
  category: string
}

export const faqCategories = [
  "General",
  "Agente IA",
  "Finanzas y Seguridad",
  "Disponibilidad",
  "Privacidad",
]

export const faqItems: FAQItem[] = [
  // General
  {
    category: "General",
    question: "¿Qué es Personal OS?",
    answer:
      "Personal OS es una aplicación personal con varias apps diseñada para centralizar y automatizar la gestión de todas las áreas de tu vida cotidiana: finanzas, agenda, proyectos, salud, suscripciones y más. Funciona como un sistema operativo personal con mini-apps interconectadas y un agente IA que las une.",
  },
  {
    category: "General",
    question: "¿En qué plataformas estará disponible?",
    answer:
      "Personal OS está siendo desarrollado como aplicación móvil nativa para iOS y Android usando React Native. Estará disponible en ambas tiendas oficiales (App Store y Google Play) cuando lancemos la primera versión.",
  },
  {
    category: "General",
    question: "¿Es gratuita la aplicación?",
    answer:
      "Aún estamos definiendo el modelo de precios. Nuestra visión es ofrecer acceso gratuito a las apps básicas, con características avanzadas de IA y automatización en un plan premium. Quienes se unan a la lista de espera serán los primeros en conocer los precios y podrían acceder a beneficios especiales.",
  },
  {
    category: "General",
    question: "¿Para quién está diseñado Personal OS?",
    answer:
      "Para personas que quieren tener control total de su vida personal y financiera sin usar docenas de apps diferentes. Si gestionas múltiples cuentas bancarias, tienes varias suscripciones activas, proyectos en curso y quieres todo en un solo lugar con ayuda de IA, Personal OS es para ti.",
  },
  // Agente IA
  {
    category: "Agente IA",
    question: "¿Cómo funciona el agente IA?",
    answer:
      "El agente IA central tiene acceso a todas tus apps y mantiene memoria persistente de tu contexto. Puedes conversar con él de forma natural ('¿Cuánto gasté en comida este mes?', 'Agenda una reunión para el martes') y puede ejecutar acciones reales: crear transacciones, agendar eventos, crear tareas. También te envía sugerencias proactivas cuando detecta algo relevante.",
  },
  {
    category: "Agente IA",
    question: "¿Qué modelos de IA usa la app?",
    answer:
      "Usamos modelos rotativos según disponibilidad y consumo, incluyendo modelos de Groq, Cerebras y OpenRouter. Esto nos permite mantener costos bajos (estimados en menos de $1 USD/mes en uso típico personal) sin sacrificar calidad de respuesta.",
  },
  {
    category: "Agente IA",
    question: "¿El agente IA puede cometer errores?",
    answer:
      "Sí, como cualquier sistema de IA. Por eso toda acción ejecutada por el agente queda registrada en un log de auditoría que puedes revisar. Para operaciones críticas como transacciones financieras, siempre pedirá confirmación antes de ejecutar.",
  },
  {
    category: "Agente IA",
    question: "¿El agente aprende de mis hábitos?",
    answer:
      "Sí. El agente mantiene un 'memory snapshot' comprimido de tu historial de interacciones y patrones de uso. Con el tiempo aprende tus categorías de gasto habituales, tus horarios preferidos y tus prioridades, para darte respuestas más personalizadas.",
  },
  // Finanzas y Seguridad
  {
    category: "Finanzas y Seguridad",
    question: "¿Cómo lee mis emails bancarios?",
    answer:
      "Usamos la API de Gmail con OAuth2, solicitando únicamente permiso de solo lectura (gmail.readonly). Nunca pedimos acceso a tu contraseña de Gmail. La app busca emails de los dominios de tus bancos y extrae información de transacciones usando parsers específicos o IA como fallback.",
  },
  {
    category: "Finanzas y Seguridad",
    question: "¿Es seguro conectar mi cuenta de Gmail?",
    answer:
      "Sí. El acceso es de solo lectura y únicamente a emails de bancos que tú configures. Los tokens OAuth2 se almacenan encriptados con AES-256 en nuestra base de datos. Puedes revocar el acceso en cualquier momento desde la configuración de tu cuenta de Google.",
  },
  {
    category: "Finanzas y Seguridad",
    question: "¿Qué bancos están soportados?",
    answer:
      "Inicialmente soportamos los bancos más comunes de República Dominicana (Banreservas, BHD, Popular). Para bancos no soportados directamente, el agente IA actúa como fallback inteligente capaz de interpretar cualquier formato de email bancario.",
  },
  {
    category: "Finanzas y Seguridad",
    question: "¿Cuánto cuesta en términos de IA la app de finanzas?",
    answer:
      "El costo operativo estimado para uso personal típico es menos de $1 USD/mes. La mayoría de emails se procesan con parsers de regex de costo cero. Solo los emails de bancos desconocidos o con formato cambiado usan IA, con un costo aproximado de $0.003 por email.",
  },
  // Disponibilidad
  {
    category: "Disponibilidad",
    question: "¿Cuándo estará disponible la app?",
    answer:
      "Estamos en fase de desarrollo activo. La app de finanzas es la prioridad número uno. No tenemos una fecha de lanzamiento pública aún, pero las personas en la lista de espera serán las primeras en recibir acceso beta y novedades.",
  },
  {
    category: "Disponibilidad",
    question: "¿Cómo me uno a la lista de espera?",
    answer:
      "Ingresa tu email en el formulario de esta página. Te enviaremos actualizaciones sobre el progreso del desarrollo, acceso anticipado a la beta y cualquier oferta especial para early adopters.",
  },
  {
    category: "Disponibilidad",
    question: "¿Puedo contribuir al proyecto?",
    answer:
      "Personal OS está siendo desarrollado de forma privada por ahora. Si eres desarrollador y te interesa colaborar, escríbenos a través del formulario de contacto y evaluaremos las oportunidades disponibles.",
  },
  // Privacidad
  {
    category: "Privacidad",
    question: "¿Qué datos recopila Personal OS?",
    answer:
      "Recopilamos tu email, nombre, timezone y las preferencias que configures. Si conectas Gmail, accedemos temporalmente a emails de tus bancos para extraer datos de transacciones. Nunca vendemos ni compartimos tus datos con terceros.",
  },
  {
    category: "Privacidad",
    question: "¿Puedo eliminar mis datos?",
    answer:
      "Sí. Tendrás acceso a una opción de eliminación de cuenta que borra todos tus datos de forma permanente de nuestros servidores. También puedes revocar el acceso a Gmail en cualquier momento desde configuración de Google.",
  },
  {
    category: "Privacidad",
    question: "¿Dónde están almacenados mis datos?",
    answer:
      "Los datos se almacenan en PostgreSQL gestionado por Supabase, en servidores de AWS en US East. Todos los datos en tránsito usan TLS y los datos sensibles (tokens OAuth) están encriptados en reposo con AES-256.",
  },
]
