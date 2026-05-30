# Arquitectura y estructura

## Principios

1. Modulos por feature en `modules/*`.
2. `shared/*` contiene infraestructura transversal, no reglas de negocio pesadas.
3. Validacion con Zod en `modules/*/schemas`.

## Arbol resumido

```text
app/        # rutas de Next.js App Router
modules/    # dominios funcionales (cada uno: components/, hooks/, services/, schemas/ types/ cuando aplica)
shared/     # UI base, config, hooks, tipos (globales, enums, contraints), providers, utilidades
migrations/ # migraciones SQL de referencia
docs/       # documentacion
```

## Flujo de dependencias

- `app/*` importa desde `modules/*` o `shared/*`.
- `modules/*` puede importar desde `shared/*`.
- `shared/*` no debe depender de `modules/*`.

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 16** - Framework React con App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Estilos utility-first
- **shadcn/ui** - Componentes accesibles y reutilizables

### Estado Global

- **Zustand** - State management ligero
- **React Query** - Datos y caché
- **React Hook Form** - Gestión de formularios

### Validación

- **Zod** - Schema validation con tipos
- **hookform/resolvers** - Integración Form + Zod

### Notificaciones

- **Sonner** - Toast notifications

### Iconos

- **Hugeicons** - Conjunto de iconos modernos
