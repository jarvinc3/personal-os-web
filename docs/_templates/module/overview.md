# `<Module>` — overview

## Propósito

Una o dos frases.

## Alcance

- Qué cubre este módulo hoy (rutas, UI, persistencia).

## Fuera de alcance

- Qué no cubre, aunque exista sheet en Settings o schema reservado.

## Actores

| Actor               | Rol |
| ------------------- | --- |
| Usuario autenticado | …   |

## Dependencias

| Dependencia | Cómo se consume                 |
| ----------- | ------------------------------- |
| API backend | enlace al contrato dueño        |
| Chrome      | `ModuleAppNav` / hoja / ninguno |

## Evidencia

- Código: `src/modules/<slug>/`
- Pruebas: …
- Runtime (si aplica): …
