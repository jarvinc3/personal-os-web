# Contribuir

Repositorio privado de una sola persona. El flujo de trabajo completo vive en [AGENTS.md](../AGENTS.md) y este archivo solo resume lo que necesitas antes de abrir un cambio.

## Antes de tocar código

1. Lee el issue en GitHub. Si no existe, créalo con [docs/issue-conventions.md](../docs/issue-conventions.md).
2. Trabaja directo en `develop`. La única excepción es la rama `refactor/ai-0`, que se integra por PR.
3. Escribe el commit en español con el formato `tipo(área): resumen`, por ejemplo `docs(readme): describir las apps del cliente`.

## Antes de cerrar

Todo cambio, incluida la documentación, corre:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
```

Un test en rojo significa que el cambio no está terminado.

## Changelog

Cada sesión actualiza `CHANGELOG.md`. Mientras dure el reset AI-0, la versión se mantiene en `0.100.0` y los cambios entran bajo `[Unreleased]`. Las reglas completas están en [docs/reference/changelog-guide.md](../docs/reference/changelog-guide.md).

## Límites

No se tocan `master`, producción, `.env` ni despliegues. El merge a `master` lo decide el dueño del repositorio.
