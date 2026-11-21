import { defineConfig, globalIgnores } from "eslint/config"
import { createRequire } from "node:module"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

// eslint-plugin-react detects the React version through context.getFilename,
// removed in ESLint 10. Pin it from package.json so the detection path never
// runs.
function readReactVersion() {
  const { dependencies } = createRequire(import.meta.url)("./package.json")
  if (!dependencies.react) {
    throw new Error("package.json must declare react in dependencies")
  }
  return dependencies.react.replace(/^[^\d]*/, "")
}

const reactVersion = readReactVersion()

// Detectable check of .cursor/rules/ui-shared-components.mdc: no native date or time inputs.
const NATIVE_DATE_INPUT_TYPES = ["date", "time", "datetime-local"]
const NATIVE_DATE_INPUT_MESSAGE =
  "Regla de UI: usa TimePairWheels, DurationWheels o DateWheels en vez de un input nativo de fecha u hora (.cursor/rules/ui-shared-components.mdc)."

// Detectable check of .cursor/rules/form-submit-disabled.mdc: no formState.isValid to gate the submit button.
const FORM_VALIDITY_MESSAGE =
  "Regla de UI: el botón de envío no se apoya en formState.isValid (marca true al montar); usa schema.safeParse(useWatch({ control })).success (.cursor/rules/form-submit-disabled.mdc)."

// Frontera de módulo: otro módulo importa solo el index.ts del feature.
const MODULE_SLUGS = [
  "auth",
  "settings",
  "notifications",
  "ai",
  "finance",
  "keep-awake",
  "home",
  "help",
]

// Settings expone configuración genérica: estos son los únicos caminos que otro
// módulo puede importar por ruta directa (issue #159).
const SETTINGS_DIRECT_IMPORT_ALLOWED = [
  "@/src/modules/settings/hooks",
  "@/src/modules/settings/types",
  "@/src/modules/settings/lib",
  "@/src/modules/settings/constants",
  "@/src/modules/settings/components/layout",
  "@/src/modules/settings/components/profile-ui",
  "@/src/modules/settings/settings-gate",
]

const SETTINGS_BOUNDARY_MESSAGE =
  "Frontera de módulo: de settings entra por ruta directa solo la configuración genérica (hooks, types, lib, constants, components/layout, components/profile-ui, settings-gate); el resto va por @/src/modules/settings."

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]/\\]/g, "\\$&")
}

const SETTINGS_ALLOWED_SOURCES =
  SETTINGS_DIRECT_IMPORT_ALLOWED.map(escapeRegExp).join("|")

const SETTINGS_DEEP_IMPORT_RESTRICTION = {
  selector: `ImportDeclaration[source.value=/^@\\/src\\/modules\\/settings\\/.+/]:not([source.value=/^(${SETTINGS_ALLOWED_SOURCES})(\\/.*)?$/])`,
  message: SETTINGS_BOUNDARY_MESSAGE,
}

function moduleBoundaryPatterns(moduleSlugs) {
  return moduleSlugs
    .filter((moduleSlug) => moduleSlug !== "settings")
    .map((moduleSlug) => ({
      group: [`@/src/modules/${moduleSlug}/*`],
      message: `Frontera de módulo: importa solo el index.ts de ${moduleSlug} (@/src/modules/${moduleSlug}).`,
    }))
}

const moduleBoundaryBlocks = [
  // app/** queda exento: cada ruta importa su screen por ruta directa para no
  // compilar las demás (issue #159).
  {
    files: [
      "src/shared/**/*.{ts,tsx}",
      "src/providers/**/*.{ts,tsx}",
      "src/config/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: moduleBoundaryPatterns(MODULE_SLUGS) },
      ],
    },
  },
  ...MODULE_SLUGS.map((moduleSlug) => ({
    files: [`src/modules/${moduleSlug}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: moduleBoundaryPatterns(
            MODULE_SLUGS.filter((otherSlug) => otherSlug !== moduleSlug)
          ),
        },
      ],
    },
  })),
]

const FINANCE_CAPABILITIES = [
  "accounts",
  "cards",
  "catalog",
  "dashboard",
  "budgets",
  "institutions",
  "loans",
  "planning",
  "product-proposals",
  "products",
  "receivables",
  "savings-goals",
  "sync",
  "transactions",
]

// Frontera de capability: dentro de finance, un hermano se importa por su index.ts.
const financeCapabilityBlocks = FINANCE_CAPABILITIES.map((capability) => ({
  files: [`src/modules/finance/${capability}/**/*.{ts,tsx}`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          ...moduleBoundaryPatterns(
            MODULE_SLUGS.filter((slug) => slug !== "finance")
          ),
          ...FINANCE_CAPABILITIES.filter(
            (otherCapability) => otherCapability !== capability
          ).map((otherCapability) => ({
            group: [`@/src/modules/finance/${otherCapability}/*`],
            message: `Frontera de capability: importa solo el index.ts de ${otherCapability} (@/src/modules/finance/${otherCapability}).`,
          })),
        ],
      },
    ],
  },
}))

const UI_SYNTAX_RESTRICTIONS = [
  {
    selector: `JSXAttribute[name.name="type"][value.value=/^(${NATIVE_DATE_INPUT_TYPES.join("|")})$/]`,
    message: NATIVE_DATE_INPUT_MESSAGE,
  },
  {
    selector:
      "MemberExpression[object.property.name='formState'][property.name='isValid']",
    message: FORM_VALIDITY_MESSAGE,
  },
  {
    selector:
      "Property[key.name='formState'] > ObjectPattern > Property[key.name='isValid']",
    message: FORM_VALIDITY_MESSAGE,
  },
]

// Import absolutos: subir de carpeta con ../ queda prohibido, salvo en .spec.ts.
const PARENT_IMPORT_MESSAGE =
  "Regla de imports: usa la ruta absoluta @/src/... en vez de subir con ../ (.cursor/rules/absolute-imports.mdc)."
const PARENT_IMPORT_SYNTAX_RESTRICTIONS = [
  "ImportDeclaration",
  "ExportNamedDeclaration",
  "ExportAllDeclaration",
  "ImportExpression",
].map((nodeType) => ({
  selector: `${nodeType}[source.value=/^\\.\\.\\//]`,
  message: PARENT_IMPORT_MESSAGE,
}))

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Agent skill templates (not application source)
    ".agents/**",
    ".claude/**",
    // Tipos generados desde el contrato OpenAPI (pnpm api:generate)
    "src/config/api-contract/api-schema.ts",
  ]),
  {
    settings: {
      react: {
        version: reactVersion,
      },
    },
    rules: {
      curly: ["error", "all"],
      "no-restricted-syntax": [
        "error",
        ...UI_SYNTAX_RESTRICTIONS,
        ...PARENT_IMPORT_SYNTAX_RESTRICTIONS,
      ],
    },
  },
  // Reglas de forma de CODING_GUIDELINES.md. Entran en `warn` para señalar el
  // backlog existente sin romper el CI; se suben a `error` cuando esté limpio.
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        // Los tipos viven en tsconfig.eslint.json porque el tsconfig de la app
        // excluye los .spec.ts y las reglas con tipos los necesitan.
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/switch-exhaustiveness-check": "warn",
      "no-nested-ternary": "warn",
      "max-depth": ["warn", 4],
      complexity: ["warn", 12],
    },
  },
  {
    // El tamaño y las promesas se miden sobre el código de producción: un spec
    // declara bloques largos por diseño y `test()` devuelve una promesa.
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/*.spec.ts"],
    rules: {
      "max-lines-per-function": ["warn", 120],
      "max-lines": [
        "warn",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      "max-params": ["warn", 3],
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
    },
  },
  {
    // Los .spec.ts quedan exentos de la regla de imports absolutos.
    files: ["**/*.spec.ts"],
    rules: {
      "no-restricted-syntax": ["error", ...UI_SYNTAX_RESTRICTIONS],
    },
  },
  ...moduleBoundaryBlocks,
  ...financeCapabilityBlocks,
  // Settings: los genéricos se importan por ruta directa solo desde los caminos
  // de la lista; dentro de settings rige la frontera normal.
  {
    files: [
      "src/shared/**/*.{ts,tsx}",
      "src/providers/**/*.{ts,tsx}",
      "src/config/**/*.{ts,tsx}",
      "src/modules/**/*.{ts,tsx}",
    ],
    ignores: ["src/modules/settings/**", "**/*.spec.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...UI_SYNTAX_RESTRICTIONS,
        ...PARENT_IMPORT_SYNTAX_RESTRICTIONS,
        SETTINGS_DEEP_IMPORT_RESTRICTION,
      ],
    },
  },
])

export default eslintConfig
