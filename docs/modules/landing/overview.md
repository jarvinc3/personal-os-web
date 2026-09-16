# Landing — overview

Layout `(landing)` + `landing-theme.tsx`. No usa `useAuthGuard`. `/` via proxy → landing o home según sesión.

Marketing. Waitlist/contacto son formularios visibles en `/landing`.

> [!WARNING]
> **REV-WEB-014** (`NO_VERIFICABLE`) — waitlist/contact pueden ser UI sin persistencia de servidor; no se afirmó endpoint Nest. [review-register.md](../../review-register.md#rev-web-014)

Copy de marketing aún dice “Mobile First”; el cliente canónico de este repo es web (ADR-001).
