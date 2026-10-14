# Settings — reglas de módulos

| ID           | Condición                       | Resultado                                                                            | Evidencia              |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------ | ---------------------- |
| `BR-SET-001` | Slug en `MODULE_REGISTRY`       | Sheet en Ajustes (`?sheet=`)                                                         | `module-sheet-keys.ts` |
| `BR-SET-002` | Solo `finance` tiene app routes | agenda/projects/health no navegan a un módulo                                        | `app/` sin esas rutas  |
| `BR-SET-003` | Config finance                  | Editable aquí; **no** vía tool `update_module_config` (backend rechaza slug finance) | backend core-tools     |
| `BR-SET-004` | Invalidación                    | Cambios de tools IA invalidan `['profile','me']`                                     | `useAiSideEffects`     |

Keep Awake no aparece como módulo de Settings (no hay `user_modules` slug).
