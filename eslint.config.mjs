import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

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
  "landing",
]

function moduleBoundaryPatterns(moduleSlugs) {
  return moduleSlugs.map((moduleSlug) => ({
    group: [`@/src/modules/${moduleSlug}/*`],
    message: `Frontera de módulo: importa solo el index.ts de ${moduleSlug} (@/src/modules/${moduleSlug}).`,
  }))
}

const moduleBoundaryBlocks = [
  {
    files: [
      "app/**/*.{ts,tsx}",
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
  ]),
  {
    rules: {
      curly: ["error", "all"],
      "no-restricted-syntax": [
        "error",
        ...UI_SYNTAX_RESTRICTIONS,
        ...PARENT_IMPORT_SYNTAX_RESTRICTIONS,
      ],
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
])

export default eslintConfig
