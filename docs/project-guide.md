# Personal OS — Guía Maestra del Proyecto

> **Fuente de verdad** para arquitectura, decisiones técnicas y modelo de datos.  
> Actualizar este documento ante cualquier cambio estructural del proyecto.

---

## Tabla de contenido

1. [Visión general](#1-visión-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura del sistema](#3-arquitectura-del-sistema)
4. [Módulos de la aplicación](#4-módulos-de-la-aplicación)
5. [Agente IA central](#5-agente-ia-central)
6. [Sistema de notificaciones](#6-sistema-de-notificaciones)
7. [Modelo de datos — Core](#7-modelo-de-datos--core)
8. [Modelo de datos — Módulo de finanzas](#8-modelo-de-datos--módulo-de-finanzas)
9. [Motor de lectura de emails bancarios](#9-motor-de-lectura-de-emails-bancarios)
10. [Convenciones y estándares](#10-convenciones-y-estándares)

---

## 1. Visión general

**Personal OS** es una aplicación personal multi-módulo (mini-apps dentro de una app) diseñada para centralizar y automatizar la gestión de las distintas áreas de la vida cotidiana: finanzas, agenda, proyectos, salud, suscripciones, y más.

### Principios fundacionales

- **Multi-usuario desde el inicio** — el modelo de datos asume `user_id` en toda entidad desde el día uno.
- **IA integrada por defecto** — un agente central con memoria persistente conectado a todos los módulos.
- **Módulos desacoplados pero interconectables** — cada módulo es independiente pero expone integraciones con otros.
- **Mobile-first** — React Native como cliente principal.
- **Automatización sobre entrada manual** — donde sea posible, los datos se capturan automáticamente (emails, APIs).

---

## 2. Stack tecnológico

| Capa                | Tecnología                                 |
| ------------------- | ------------------------------------------ |
| Backend             | NestJS (Node.js + TypeScript)              |
| Base de datos       | PostgreSQL - Supabase                      |
| ORM                 | Prisma                                     |
| Mobile              | React Native                               |
| IA / Agente         | Groq, Cerebras, Openrouter                 |
| Autenticación       | Supabase Auth + OAuth2 (Google para Gmail) |
| Notificaciones push | Expo Notifications / FCM                   |
| Lectura de email    | Gmail API (OAuth2) + IMAP (fallback)       |
| Tipos de cambio     | API de tasas de cambio: frankfurter.app    |
| Tareas programadas  | NestJS `@nestjs/schedule` (cron jobs)      |

---

## 3. Arquitectura del sistema

```md
┌─────────────────────────────────────────────────────────┐
│                    React Native App                     │
│         (módulos UI + chat con agente IA)               │
└────────────────────────┬────────────────────────────────┘
                         │ REST / WebSocket
┌────────────────────────▼────────────────────────────────┐
│                   NestJS Backend                        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐   │
│  │ Finance  │  │  Agenda  │  │ Projects │  │  ...   │   │
│  │  Module  │  │  Module  │  │  Module  │  │        │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘   │
│       │             │             │            │        │
│  ┌────▼─────────────▼─────────────▼────────────▼───────┐│
│  │              AI Agent Service (central)              │
│  │        Ai Agent + memoria persistente              │
│  └──────────────────────────────────────────────────────┘
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │   Notification Service  |  Email Sync Jobs       │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    PostgreSQL DB                        │
└─────────────────────────────────────────────────────────┘
```

### Flujo de datos — Email → Transacción

```md
Gmail/IMAP → EmailService → TransactionParserService
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
              Regex Parser                  Ai Agent
           (bancos conocidos)            (fallback IA)
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                         fin_transactions (DB)
                                   │
                         Notificación al usuario
```

---

## 4. Módulos de la aplicación

### Módulos planificados

| Módulo                      | Prefijo DB | Estado      | Prioridad |
| --------------------------- | ---------- | ----------- | --------- |
| Finanzas personales         | `fin_`     | 🟡 En diseño | 1         |
| Suscripciones personales    | `sub_`     | ⚪ Pendiente | 2         |
| Agenda personal             | `agn_`     | ⚪ Pendiente | 3         |
| Administración de proyectos | `prj_`     | ⚪ Pendiente | 4         |
| Salud y alimentación        | `hlth_`    | ⚪ Pendiente | 5         |

### Integraciones entre módulos (planificadas)

| Módulo A      | Módulo B | Tipo de integración                                             |
| ------------- | -------- | --------------------------------------------------------------- |
| Suscripciones | Finanzas | `sub_items` → genera/vincula `fin_transactions` automáticamente |
| Suscripciones | Agenda   | Alertas de vencimiento aparecen en calendario                   |
| Proyectos     | Agenda   | Tareas con fecha → eventos en calendario                        |
| Proyectos     | Finanzas | Proyectos con presupuesto → `fin_budgets`                       |
| Salud         | Agenda   | Citas médicas, rutinas en calendario                            |

---

## 5. Agente IA central

### Filosofía

- Un **agente central único** para toda la app (no uno por módulo).
- El agente tiene **acceso a todos los módulos** según contexto.
- Dos modos de interacción: **chat conversacional** + **sugerencias proactivas** en pantalla.
- El agente puede **ejecutar acciones reales**: crear transacciones, agendar eventos, crear tareas.

### Modelo utilizado

```md
Modelos rotacionales segun consumo (Groq, Cerebras, Openrouter)
```

### Memoria y contexto

- `ai_agent_sessions` — una sesión activa por usuario (con scope de módulo opcional).
- `memory_snapshot` (JSONB) — resumen comprimido del contexto de largo plazo. Se actualiza al finalizar cada sesión.
- `ai_messages` — historial completo de mensajes (rol: `user` | `assistant` | `tool`).
- `ai_actions` — registro de auditoría de todas las acciones ejecutadas por el agente.

### Ejemplo de acción del agente

```json
{
  "action_type": "create_transaction",
  "target_module": "finance",
  "payload": {
    "account_id": "uuid",
    "amount": 1500.00,
    "currency": "DOP",
    "merchant": "Supermercado Nacional",
    "category_id": "uuid",
    "transaction_date": "2025-05-16"
  },
  "status": "completed"
}
```

### Costo estimado del agente

- ~500 tokens input + ~100 tokens output por interacción.
- Costo aproximado: **$0.003 USD por mensaje** con claude-sonnet-4.
- Para uso personal: **< $1 USD/mes** en escenario típico.

---

## 6. Sistema de notificaciones

### Canales

| Canal    | Descripción                                   |
| -------- | --------------------------------------------- |
| `in_app` | Notificación dentro de la app (badge, banner) |
| `push`   | Push notification al dispositivo (Expo/FCM)   |
| `email`  | Email al usuario (futuro)                     |

### Tipos de notificaciones (módulo finanzas)

| Tipo                   | Trigger                              |
| ---------------------- | ------------------------------------ |
| `transaction_detected` | Nueva transacción detectada en email |
| `budget_alert`         | Presupuesto al X% del límite         |
| `unusual_expense`      | Gasto inusual detectado por IA       |
| `monthly_report`       | Reporte mensual automático           |
| `card_due_date`        | Recordatorio de pago de tarjeta      |
| `subscription_renewal` | (desde módulo suscripciones)         |

### Tokens push

- Tabla `push_tokens` guarda un token por plataforma (`ios` | `android`) por usuario.
- Los tokens se actualizan al iniciar sesión en el dispositivo.
- Tokens inactivos (`is_active = false`) se desactivan cuando FCM reporta invalidación.

---

## 7. Modelo de datos — Core

### `users`

| Campo         | Tipo      | Descripción                            |
| ------------- | --------- | -------------------------------------- |
| `id`          | uuid PK   | Identificador único                    |
| `email`       | string    | Email único del usuario                |
| `full_name`   | string    | Nombre completo                        |
| `avatar_url`  | string    | URL del avatar                         |
| `timezone`    | string    | Ej: `America/Santo_Domingo`            |
| `locale`      | string    | Ej: `es-DO`                            |
| `preferences` | jsonb     | Configuraciones personales del usuario |
| `created_at`  | timestamp | —                                      |
| `updated_at`  | timestamp | —                                      |

### `modules`

Catálogo de módulos disponibles en el sistema.

| Campo         | Tipo    | Descripción                                |
| ------------- | ------- | ------------------------------------------ |
| `id`          | uuid PK | —                                          |
| `slug`        | string  | Ej: `finance`, `agenda`, `projects`        |
| `key`         | string  | Ej: `fin`, `agn`, `prj`                    |
| `name`        | string  | Nombre legible                             |
| `description` | string  | Descripcion de el modulo                   |
| `is_active`   | boolean | Si el módulo está habilitado en el sistema |
| `sort_order`  | int     | Orden de aparición en la app               |

### `user_modules`

Qué módulos tiene habilitados cada usuario y su configuración personal.

| Campo        | Tipo              | Descripción                                           |
| ------------ | ----------------- | ----------------------------------------------------- |
| `id`         | uuid PK           | —                                                     |
| `user_id`    | uuid FK → users   | —                                                     |
| `module_id`  | uuid FK → modules | —                                                     |
| `is_enabled` | boolean           | Si el usuario tiene activo este módulo                |
| `config`     | jsonb             | Configuración específica del módulo para este usuario |
| `enabled_at` | timestamp         | Cuándo activó el módulo                               |

### `ai_agent_sessions`

| Campo             | Tipo              | Descripción                                          |
| ----------------- | ----------------- | ---------------------------------------------------- |
| `id`              | uuid PK           | —                                                    |
| `user_id`         | uuid FK → users   | —                                                    |
| `module_id`       | uuid FK → modules | Módulo en contexto (null = global)                   |
| `context_type`    | string            | `global`                                             |
| `memory_snapshot` | jsonb             | Resumen comprimido del historial para contexto largo |
| `last_active_at`  | timestamp         | Última interacción                                   |
| `created_at`      | timestamp         | —                                                    |

### `ai_messages`

| Campo        | Tipo                        | Descripción                           |
| ------------ | --------------------------- | ------------------------------------- |
| `id`         | uuid PK                     | —                                     |
| `session_id` | uuid FK → ai_agent_sessions | —                                     |
| `role`       | string                      | `user`                                |
| `content`    | text                        | Contenido del mensaje                 |
| `tool_calls` | jsonb                       | Herramientas invocadas (si aplica)    |
| `metadata`   | jsonb                       | Tokens usados, modelo, latencia, etc. |
| `created_at` | timestamp                   | —                                     |

### `ai_actions`

Registro de auditoría de acciones ejecutadas por el agente.

| Campo           | Tipo                  | Descripción                                |
| --------------- | --------------------- | ------------------------------------------ |
| `id`            | uuid PK               | —                                          |
| `session_id`    | uuid FK               | —                                          |
| `message_id`    | uuid FK → ai_messages | Mensaje que disparó la acción              |
| `action_type`   | string                | Ej: `create_transaction`, `schedule_event` |
| `target_module` | string                | Módulo sobre el que actúa                  |
| `payload`       | jsonb                 | Datos enviados a la acción                 |
| `status`        | string                | `pending`                                  |
| `result`        | jsonb                 | Resultado de la ejecución                  |
| `executed_at`   | timestamp             | —                                          |

### `notifications`

| Campo          | Tipo            | Descripción                              |
| -------------- | --------------- | ---------------------------------------- |
| `id`           | uuid PK         | —                                        |
| `user_id`      | uuid FK → users | —                                        |
| `type`         | string          | Tipo de notificación (ver sección 6)     |
| `channel`      | string          | `in_app`                                 |
| `title`        | string          | Título de la notificación                |
| `body`         | text            | Cuerpo del mensaje                       |
| `data`         | jsonb           | Payload adicional (deep link, IDs, etc.) |
| `is_read`      | boolean         | Si fue leída (para in_app)               |
| `scheduled_at` | timestamp       | Para notificaciones diferidas            |
| `sent_at`      | timestamp       | Cuándo fue enviada efectivamente         |
| `created_at`   | timestamp       | —                                        |

### `push_tokens`

| Campo        | Tipo            | Descripción           |
| ------------ | --------------- | --------------------- |
| `id`         | uuid PK         | —                     |
| `user_id`    | uuid FK → users | —                     |
| `platform`   | string          | `ios`                 |
| `token`      | string          | Token de Expo/FCM     |
| `is_active`  | boolean         | Si el token es válido |
| `created_at` | timestamp       | —                     |

---

## 8. Modelo de datos — Módulo de finanzas

Todas las tablas llevan el prefijo `fin`_.

### `fin_accounts`

Representa cualquier instrumento financiero del usuario.

| Campo                   | Tipo            | Descripción                                           |
| ----------------------- | --------------- | ----------------------------------------------------- |
| `id`                    | uuid PK         | —                                                     |
| `user_id`               | uuid FK → users | —                                                     |
| `name`                  | string          | Ej: `Visa BHD`, `Cuenta Banreservas`                  |
| `type`                  | string          | `credit_card`                                         |
| `institution`           | string          | Nombre del banco o institución                        |
| `currency`              | string          | Moneda base de la cuenta (ISO 4217, ej: `DOP`, `USD`) |
| `balance`               | decimal         | Balance actual                                        |
| `credit_limit`          | decimal         | Límite de crédito (solo tarjetas)                     |
| `statement_closing_day` | date            | Día de cierre del estado de cuenta                    |
| `payment_due_day`       | date            | Día límite de pago                                    |
| `is_active`             | boolean         | Si la cuenta está activa                              |
| `created_at`            | timestamp       | —                                                     |

### `fin_email_sources`

Configuración de buzones de email vinculados a una cuenta bancaria.

| Campo            | Tipo                   | Descripción                         |
| ---------------- | ---------------------- | ----------------------------------- |
| `id`             | uuid PK                | —                                   |
| `user_id`        | uuid FK → users        | —                                   |
| `account_id`     | uuid FK → fin_accounts | Cuenta bancaria asociada            |
| `provider`       | string                 | `gmail`                             |
| `email_address`  | string                 | Dirección de email del buzón        |
| `bank_domain`    | string                 | Ej: `banreservas.com`, `bhd.com.do` |
| `access_token`   | text                   | Token OAuth2 (encriptado)           |
| `refresh_token`  | text                   | Refresh token OAuth2 (encriptado)   |
| `last_synced_at` | timestamp              | Última sincronización exitosa       |
| `is_active`      | boolean                | —                                   |

### `fin_transactions`

| Campo                  | Tipo                     | Descripción                                   |
| ---------------------- | ------------------------ | --------------------------------------------- |
| `id`                   | uuid PK                  | —                                             |
| `account_id`           | uuid FK → fin_accounts   | —                                             |
| `user_id`              | uuid FK → users          | Denormalizado para queries rápidas            |
| `category_id`          | uuid FK → fin_categories | —                                             |
| `email_message_id`     | string                   | ID del email origen (para deduplicación)      |
| `type`                 | string                   | `debit`                                       |
| `amount`               | decimal                  | Monto en la moneda original de la transacción |
| `amount_base_currency` | decimal                  | Monto convertido a la moneda base del usuario |
| `currency`             | string                   | Moneda de la transacción (ISO 4217)           |
| `exchange_rate`        | decimal                  | Tasa de cambio usada (si aplica)              |
| `merchant`             | string                   | Nombre del comercio                           |
| `description`          | text                     | Descripción completa                          |
| `transaction_date`     | date                     | Fecha de la transacción                       |
| `status`               | string                   | `pending`                                     |
| `is_recurring`         | boolean                  | Si la IA detectó que es recurrente            |
| `ai_metadata`          | jsonb                    | Análisis y etiquetas del agente IA            |
| `created_at`           | timestamp                | —                                             |

> **Nota multi-moneda:** siempre guardar `amount` en la moneda original + `amount_base_currency` en la moneda base del usuario + `exchange_rate` del momento. Esto permite reportes consistentes sin perder el dato original.

### `fin_categories`

Categorías jerárquicas (self-referencial, soporta subcategorías).

| Campo       | Tipo                     | Descripción                                 |
| ----------- | ------------------------ | ------------------------------------------- |
| `id`        | uuid PK                  | —                                           |
| `user_id`   | uuid FK → users          | Null para categorías del sistema            |
| `name`      | string                   | Ej: `Comida`, `Restaurantes`, `Delivery`    |
| `icon`      | string                   | Nombre del ícono                            |
| `color`     | string                   | Color hex                                   |
| `parent_id` | uuid FK → fin_categories | Para subcategorías                          |
| `is_system` | boolean                  | Si es una categoría predefinida del sistema |

### `fin_budgets`

Presupuestos mensuales por categoría.

| Campo                  | Tipo                     | Descripción                                      |
| ---------------------- | ------------------------ | ------------------------------------------------ |
| `id`                   | uuid PK                  | —                                                |
| `user_id`              | uuid FK → users          | —                                                |
| `category_id`          | uuid FK → fin_categories | —                                                |
| `year`                 | int                      | Año del presupuesto                              |
| `month`                | int                      | Mes del presupuesto (1–12)                       |
| `amount_limit`         | decimal                  | Límite del presupuesto                           |
| `amount_spent`         | decimal                  | Gasto acumulado (actualizado en tiempo real)     |
| `alert_threshold_pct`  | decimal                  | % del límite que dispara alerta (ej: 0.80 = 80%) |
| `ai_suggestion_status` | string                   | `suggested`                                      |
| `created_at`           | timestamp                | —                                                |

### `fin_budget_alerts`

Registro de alertas disparadas por presupuestos.

| Campo          | Tipo                  | Descripción                                   |
| -------------- | --------------------- | --------------------------------------------- |
| `id`           | uuid PK               | —                                             |
| `budget_id`    | uuid FK → fin_budgets | —                                             |
| `type`         | string                | `threshold_warning`                           |
| `pct_used`     | decimal               | Porcentaje del límite al momento de la alerta |
| `was_notified` | boolean               | Si se envió notificación al usuario           |
| `triggered_at` | timestamp             | —                                             |

### `fin_recurring_patterns`

Análisis de la IA sobre gastos recurrentes detectados.

| Campo                | Tipo                     | Descripción                    |
| -------------------- | ------------------------ | ------------------------------ |
| `id`                 | uuid PK                  | —                              |
| `user_id`            | uuid FK → users          | —                              |
| `category_id`        | uuid FK → fin_categories | —                              |
| `merchant`           | string                   | Nombre del comercio recurrente |
| `avg_amount`         | decimal                  | Monto promedio                 |
| `frequency`          | string                   | `daily`                        |
| `next_expected_date` | date                     | Próxima fecha estimada         |
| `confidence_score`   | int                      | Confianza de la IA (0–100)     |
| `ai_analysis`        | jsonb                    | Razonamiento del agente        |

### `fin_exchange_rates`

Histórico de tasas de cambio para reportes precisos.

| Campo           | Tipo    | Descripción          |
| --------------- | ------- | -------------------- |
| `id`            | uuid PK | —                    |
| `from_currency` | string  | ISO 4217 (ej: `USD`) |
| `to_currency`   | string  | ISO 4217 (ej: `DOP`) |
| `rate`          | decimal | Tasa de cambio       |
| `rate_date`     | date    | Fecha de la tasa     |

---

## 9. Motor de lectura de emails bancarios

### Flujo completo

```md
1. Usuario conecta Gmail vía OAuth2 (scope: gmail.readonly)
2. Cron job cada 6 horas por usuario activo
3. Fetch emails filtrados por dominio bancario
4. Parser intenta regex por banco conocido
5. Si falla regex → fallback a Ai Agent
6. Transacción guardada con email_message_id (deduplicación)
7. Notificación in-app + push al usuario
```

### Estrategia de parsing

| Estrategia      | Cuándo                                                  | Costo         |
| --------------- | ------------------------------------------------------- | ------------- |
| Regex por banco | Bancos con formato conocido (Banreservas, BHD, Popular) | $0            |
| Ai Agent        | Bancos desconocidos o formato cambiado                  | ~$0.003/email |

### Seguridad

- Los `access_token` y `refresh_token` se guardan **encriptados** en la DB (AES-256).
- Scope OAuth2 solicitado: **solo lectura** (`gmail.readonly`).
- Nunca se almacenan contraseñas de email.
- El `email_message_id` previene procesar el mismo email dos veces.

### Costo operativo estimado (uso personal)

| Componente                  | Costo mensual estimado       |
| --------------------------- | ---------------------------- |
| Gmail API                   | $0 (dentro del free tier)    |
| IMAP                        | $0                           |
| Ai Agent (parsing fallback) | ~$0.30 (worst case, 100% IA) |
| Ai Agent (uso típico)       | ~$0.05 (mayoría por regex)   |

---

## 10. Convenciones y estándares

### Nomenclatura de tablas

- **Prefijo por módulo** obligatorio: `fin_`, `sub_`, `cal_`, `prj_`, `hlth_`.
- Tablas del core sin prefijo: `users`, `modules`, `user_modules`, `notifications`, etc.
- Snake_case siempre.

### IDs

- Todos los IDs son **UUID v4**.
- Nunca IDs enteros autoincrementales (facilita distribución y privacidad).

### Timestamps

- Todas las tablas tienen `created_at`. Las entidades mutables tienen también `updated_at`.
- Siempre en UTC en la DB. La conversión al timezone del usuario se hace en el cliente.

### Campos JSONB

Usados para datos flexibles o análisis IA. Documenta siempre la estructura esperada en comentarios del código.

### Soft deletes

Preferir `is_active = false` sobre borrado físico en entidades importantes (cuentas, categorías, etc.).

### Variables de entorno requeridas

```env
# ── Base de datos ────────────────────────────────────────────
DATABASE_URL="postgresql://postgres.[project_id]:[password]@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# ── IA (free tier) ────────────────────────
CEREBRAS_API_KEY="YOUR_CEREBRAS_API_KEY"
GROQ_API_KEY="YOUR_GROQ_API_KEY"
OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"

# ── Google OAuth (para Gmail API) ────────────────────────────
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
GOOGLE_REDIRECT_URI=http://localhost:3100/auth/google/callback

# ── App ──────────────────────────────────────────────────────
PORT=3100
NODE_ENV="development"
CORS_ORIGIN=http://localhost:5173
API_URL=http://localhost:3100
API_PREFIX="api"
SWAGGER_PATH="docs"

# ── Moneda base (para conversiones) ──────────────────────────
BASE_CURRENCY="DOP"
EXCHANGE_RATE_HOST_API_KEY="YOUR_EXCHANGE_RATE_HOST_API_KEY"
```

---
