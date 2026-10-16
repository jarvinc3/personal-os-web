# Estándar documental — personal-os-web

El estándar canónico vive en el repositorio hermano: [personal-os-back/docs/documentation-standard.md](https://github.com/jarvinc3/personal-os-back/blob/develop/docs/documentation-standard.md). Aplica a ambos repos; este documento solo recuerda lo propio de la web.

## Seguimiento

El estado, el roadmap y los hallazgos viven en GitHub Issues del repositorio, no en `docs/`. Lo decidido y no implementado se abre con label `roadmap`. Los documentos de trabajo cerrados pasan a [archive/](./archive/): pendientes, registro de revisión, auditorías y mockups.

Un `REV-*` no se deja suelto en un documento: se convierte en issue o se archiva con su resolución.

## Archivos de un módulo

`README.md` + `capabilities/` + `contracts/` + `rules/`; sin `status.md`. El estado y lo pendiente van a Issues.

Propiedad canónica: el dominio y el contrato HTTP viven en `personal-os-back`; aquí solo las rutas, la UX, el estado del cliente y el consumo de la API. Las referencias cruzadas enlazan al dueño.
