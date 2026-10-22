# Módulos (web)

Implementados en `src/modules/` con rutas en `app/`.

| Módulo          | Código                       | Doc                                         | Rutas                                                  |
| --------------- | ---------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| Auth            | `src/modules/auth/`          | [auth/](./auth/README.md)                   | `/login`, `/verify-email`, `/auth/callback`            |
| Settings        | `src/modules/settings/`      | [settings/](./settings/README.md)           | `/settings`                                            |
| Notifications   | `src/modules/notifications/` | [notifications/](./notifications/README.md) | `/notifications`                                       |
| AI              | `src/modules/ai/`            | [ai/](./ai/README.md)                       | `/chat`                                                |
| Finance         | `src/modules/finance/`       | [finance/](./finance/README.md)             | `/finance/*`                                           |
| Keep Awake      | `src/modules/keep-awake/`    | [keep-awake/](./keep-awake/README.md)       | `/keep-awake`                                          |
| Home            | `src/modules/home/`          | [home/](./home/README.md)                   | `/home`                                                |
| Centro de ayuda | `src/modules/help/`          | [help/](./help/README.md)                   | `/help`, `/help/glossary`, `/help/guides`, `/help/faq` |

## Solo Settings (sin app routes)

Agenda, Projects, Health — sheets `Edit*Sheet`. No documentar como módulos de producto entregados. Suscripciones dejó de ser un módulo aparte: su sección vive en los ajustes de Finanzas (`/settings/finance#suscripciones`) y su gestor en `/finance/subscriptions` (pendiente 08, implementado).

Chrome transversal: [architecture/module-conventions.md](../architecture/module-conventions.md).
