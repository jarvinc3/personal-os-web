# Auth — reglas

| ID            | Condición                                                    | Resultado                                                                    | Evidencia                                |
| ------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------- |
| `BR-AUTH-001` | No hay `user.profile`                                        | `isAuthenticated=false` aunque exista sesión Supabase                        | `use-auth-guard.ts`                      |
| `BR-AUTH-002` | `GET /users/me` 404, 4xx, 5xx, red o perfil sin `id`+`email` | `BackendProfileUnavailableError` + `revokeAuthSession`                       | `hydrate-auth-user.ts`                   |
| `BR-AUTH-003` | Path protegido sin usuario de proxy                          | Redirect `/login`                                                            | `proxy-routes.ts` (`isProtectedAppPath`) |
| `BR-AUTH-004` | `/login` con usuario Supabase                                | Redirect `/home`                                                             | `proxy-routes.ts`                        |
| `BR-AUTH-005` | `/`                                                          | `/home` si hay user, si no `/login`                                          | `proxy-routes.ts`                        |
| `BR-AUTH-006` | Error de Supabase con código                                 | Mensaje en español por código; código desconocido → respaldo de la operación | `auth-error-messages.ts`                 |
| `BR-AUTH-007` | Contraseña en registro o login                               | Mínimo 6 caracteres con mayúscula, minúscula y número                        | `password-policy.ts`                     |
