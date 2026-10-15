# Roadmap — personal-os-web

> Hallazgos del [registro de revisión](./review-register.md) que se decidieron **no** implementar en el saneamiento (pendiente 17). Sin código asociado. Se retoman cuando el producto los pida y con presupuesto propio.

| REV         | Qué falta                                                                                 | Evidencia                                                       | Cuándo se retoma                                            |
| ----------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| REV-WEB-009 | Tests de integración de auth hooks y del api client                                       | No hay specs en `auth` / `settings` / `ai`; solo spec de reglas | Al endurecer la sesión o el envelope de la API              |
| REV-WEB-011 | Tools de dominio por slug en el agente (`agenda-tools`, `projects-tools`, `health-tools`) | Los archivos no existen en `personal-os-back`                   | Cuando existan los módulos Agenda/Proyectos/Salud en la API |
| REV-WEB-014 | Captura de leads en la landing (waitlist, contacto) con endpoint real                     | No hay endpoint Nest de waitlist en el inventario               | Si la landing deja de ser informativa                       |

Los hallazgos con dueño en el backend (`REV-BACK-006`, `REV-BACK-007`, `REV-BACK-008`) viven en el roadmap de `personal-os-back`.
