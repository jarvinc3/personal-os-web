import { API_SCHEMA_PATH, writeApiSchema } from "./generate.ts"

await writeApiSchema()
process.stdout.write(`Tipos del API generados en ${API_SCHEMA_PATH}.\n`)
