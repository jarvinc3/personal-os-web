# Auth — contratos que consume

Dueño HTTP perfil/delete: backend Users. Este cliente no llama `GET /api/auth/session` en los hooks de login (la constante `AUTH.SESSION` existe en `api-endpoints.ts` y **no** se usa en auth hooks).

| Superficie | Uso |
| --- | --- |
| Supabase Auth JS | login, register, OAuth, logout, refresh |
| `GET /users/me` | Hidratar; obligatorio |
| `DELETE /users/me` | Borrado de cuenta |
| `POST/PATCH` push-tokens | Logout desactiva token |

Checklist de providers: [../../../infrastructure/supabase-auth-checklist.md](../../../infrastructure/supabase-auth-checklist.md).
