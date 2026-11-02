# Matriz de trazabilidad — personal-os-web

Cada fila: documentación destino y evidencia de código. El seguimiento de estado, roadmap y hallazgos vive en GitHub Issues del repositorio (label `roadmap`).

| Área                   | Doc                                                                                                | Código                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Auth                   | `modules/auth/`                                                                                    | `src/modules/auth/`, `app/(auth)`, `app/auth/callback`   |
| Settings               | `modules/settings/`                                                                                | `src/modules/settings/`                                  |
| Notifications          | `modules/notifications/`                                                                           | + `public/sw.js`                                         |
| AI (histórico)         | `modules/ai/` — chat retirado en AI-0; vuelve con AI-9                                             | —                                                        |
| Finance                | `modules/finance/`                                                                                 | `app/(app)/finance/**`                                   |
| Keep Awake             | `modules/keep-awake/`                                                                              | provider en `(app)/layout`                               |
| Home                   | `modules/home/`                                                                                    | `home-screen.tsx`                                        |
| Landing                | repo `personal-os-landing` (Astro)                                                                 | `next.config.mjs` (redirecciones permanentes)            |
| API client             | `infrastructure/api-client.md`                                                                     | `src/config/api-client.ts`                               |
| Routes                 | este mapa                                                                                          | `app-routes.ts`                                          |
| Defaults prefs         | settings overview                                                                                  | `user-settings-defaults.ts`                              |
| Auth reglas            | `modules/auth/rules/session.md`                                                                    | `BR-AUTH-001`–`005`, `AC-AUTH-001`–`003`                 |
| NTF cliente            | `modules/notifications/rules/channels.md`                                                          | `BR-NTF-W-*`; dominio quiet hours = backend `BR-NTF-001` |
| AI cliente (histórico) | `modules/ai/rules/chat.md` — reglas del chat retirado en AI-0                                      | —                                                        |
| Finance UI             | `modules/finance/rules/gate.md`                                                                    | `BR-FIN-W-*`; ledger = backend `BR-FIN-*`                |
| Keep Awake             | `modules/keep-awake/rules/session.md`                                                              | `BR-KAW-001`–`005`                                       |
| Docs cerrados          | `archive/` (pendientes, registro de revisión, auditorías y mockups)                                | histórico; no es fuente de comportamiento vigente        |
| Trabajo abierto        | [Issues con label `roadmap`](https://github.com/jarvinc3/personal-os-web/issues?q=label%3Aroadmap) | sin código todavía                                       |

La landing vive en el repo hermano `personal-os-landing`; este cliente solo redirige sus rutas públicas (ver `src/shared/constants/landing.mjs`).
