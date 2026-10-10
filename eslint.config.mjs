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
      "no-restricted-syntax": [
        "error",
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
      ],
    },
  },
])

export default eslintConfig
