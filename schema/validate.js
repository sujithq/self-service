import * as Ajv from 'ajv'
import fs from 'fs'
import { jsonc } from 'jsonc'

const schema = JSON.parse(
  fs.readFileSync(
    `${process.env.GITHUB_WORKSPACE || process.cwd()}/schema/issueops-self-service-v1.json`,
    'utf8'
  )
)
const data = JSON.parse(
  fs.readFileSync(
    `${process.env.GITHUB_WORKSPACE || process.cwd()}/data/issue-ops.json`,
    'utf8'
  )
)

// Validate the input config against the schema.
const ajv = new Ajv.default({ allowUnionTypes: true })
const validateSchema = ajv.compile(schema)

if (!validateSchema(data))
  throw new Error(
    `Invalid State Machine Config: ${jsonc.stringify(validateSchema.errors)}`
  )
