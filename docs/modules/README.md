# Módulos (web)

Implementados en `src/modules/` con rutas en `app/`.

| Módulo        | Código                       | Doc                                         | Rutas                                       |
| ------------- | ---------------------------- | ------------------------------------------- | ------------------------------------------- |
| Auth          | `src/modules/auth/`          | [auth/](./auth/README.md)                   | `/login`, `/verify-email`, `/auth/callback` |
| Settings      | `src/modules/settings/`      | [settings/](./settings/README.md)           | `/settings`                                 |
| Notifications | `src/modules/notifications/` | [notifications/](./notifications/README.md) | `/notifications`                            |
| AI            | `src/modules/ai/`            | [ai/](./ai/README.md)                       | `/chat`                                     |
| Finance       | `src/modules/finance/`       | [finance/](./finance/README.md)             | `/finance/*`                                |
| Keep Awake    | `src/modules/keep-awake/`    | [keep-awake/](./keep-awake/README.md)       | `/keep-awake`                               |
| Home          | `src/modules/home/`          | [home/](./home/README.md)                   | `/home`                                     |
| Landing       | `src/modules/landing/`       | [landing/](./landing/README.md)             | `/landing`, legal, `/delete-account`        |

## Solo Settings (sin app routes)

Agenda, Projects, Health, Subscriptions — sheets `Edit*Sheet`. No documentar como módulos de producto entregados. Subscriptions ya no será un módulo aparte: se integra en Finanzas (vista básica de recurrentes en `/finance/subscriptions` y gestor completo en el pendiente [08](./finance/pendientes/08-suscripciones.md)).

Chrome transversal: [architecture/module-conventions.md](../architecture/module-conventions.md).
