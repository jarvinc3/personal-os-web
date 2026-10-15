# Glosario: App y módulo

Decisión de producto: de cara al usuario, cada área de Personal OS es una **App** y el producto completo es **Personal OS**. En código y arquitectura el término sigue siendo **módulo**.

Esta regla rige en `personal-os-web` y en `personal-os-back`. Contenido idéntico en ambos repos.

## Los dos términos

**App** — término de cara al usuario. Nombra cada área que la persona activa y usa: Finanzas, Agenda, Salud, Proyectos, Keep Awake. En singular o plural se escribe con mayúscula cuando encabeza un título ("Apps", "App activa") y en minúscula dentro de una frase ("la app Finanzas").

**Módulo / module** — término de código y arquitectura. Es el nombre interno en carpetas, símbolos y contratos, y no se renombra.

## Qué se dice y qué no

| Contexto                                      | Se escribe                                | No se escribe               |
| --------------------------------------------- | ----------------------------------------- | --------------------------- |
| Título de la sección en Ajustes               | "Apps"                                    | "Módulos"                   |
| Estado de un interruptor en Ajustes           | "App activa"                              | "Módulo activo"             |
| Toast al activar                              | "App activada"                            | "Módulo activado"           |
| Mensaje de un área apagada                    | "Activa la app Finanzas en Ajustes"       | "Activa el módulo Finanzas" |
| Texto de ayuda (`fieldGuide`)                 | "Moneda y calendario de la app Finanzas." | "...del módulo Finanzas."   |
| Acción del agente IA                          | "Activar app Finanzas"                    | "Activar módulo Finanzas"   |
| Rendimiento vacío basado en `MODULE_REGISTRY` | "Apps"                                    | "Módulos"                   |

## Qué se mantiene igual

Estos son código, no copy de usuario. No se renombran ni se traducen:

- Carpetas y paquetes: `src/modules/<slug>/`, `packages/<nombre>/`, `apps/api/`.
- Símbolos y tipos: `MODULE_REGISTRY`, `ModuleSlug`, `ModuleConfig`, `user_modules`, `moduleSlug`, `MODULE_CONTEXT`.
- Rutas, archivos, tests, logs, mensajes de error técnicos y contratos HTTP.
- Documentación de arquitectura y convenciones, donde "módulo" describe la estructura del código.

## Ejemplo

```text
Interfaz (Ajustes):        Apps · "App activa" · "Activa la app Finanzas"
Código (web):              src/modules/finance, MODULE_REGISTRY, ModuleSlug
Código (back):             packages/finance, user_modules, moduleSlug
```

La regla de código vive en [`.cursor/rules/`](../.cursor/rules). El vocabulario del dominio está en [CONTEXT.md](../CONTEXT.md).
