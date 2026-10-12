# Auth — estado

Fecha: 2026-09-15

| Ítem                                 | Estado        | Evidencia                                            |
| ------------------------------------ | ------------- | ---------------------------------------------------- |
| Login/register sheets                | `implemented` | `login-screen.tsx`                                   |
| Google OAuth + callback              | `implemented` | `app/auth/callback/route.ts`                         |
| Verify email                         | `implemented` | `verify-email`                                       |
| Bootstrap 3s + 401 toast             | `implemented` | `use-auth-bootstrap.ts`                              |
| Hidratar `GET /users/me` obligatorio | `implemented` | `hydrate-auth-user.ts`                               |
| Google-only delete                   | `implemented` | `pendingAccountDeletion` + `/delete-account` landing |
| Tests de hooks                       | `planned`     | no hay `auth/*.spec.ts` — REV-WEB-009                |
