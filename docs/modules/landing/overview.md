# Landing — overview

Layout `(landing)` + `landing-theme.tsx`. No usa `useAuthGuard`. `/` via proxy → landing o home según sesión.

Marketing. Waitlist/contacto son formularios visibles en `/landing`.

> [!WARNING]
> **REV-WEB-014** (`NO_VERIFICABLE`) — waitlist/contact pueden ser UI sin persistencia de servidor; no se afirmó endpoint Nest. [Issue #145](https://github.com/jarvinc3/personal-os-web/issues/145)

Copy de marketing aún dice “Mobile First”; el cliente canónico de este repo es web (ADR-001).
