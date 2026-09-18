import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const supportedTypes = new Map([
  ['uuid', 'TEXT'],
  ['timestamptz', 'TEXT'],
  ['timestamp with time zone', 'TEXT'],
  ['timestamp without time zone', 'TEXT'],
  ['timestamp', 'TEXT'],
  ['jsonb', 'TEXT'],
  ['bigint', 'INTEGER'],
  ['integer', 'INTEGER'],
  ['smallint', 'INTEGER'],
  ['boolean', 'INTEGER'],
  ['text', 'TEXT'],
  ['character varying', 'TEXT'],
  ['varchar', 'TEXT'],
])

function quoteIdentifier(identifier) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) throw new Error(`Unsafe SQLite identifier: ${identifier}`)
  return `"${identifier}"`
}

function quoteSql(value) {
  return `'${value.replaceAll("'", "''")}'`
}

function splitDefinitions(input) {
  const definitions = []
  let start = 0
  let depth = 0
  let quoted = false
  let escaped = false
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]
    if (quoted) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === "'") {
        if (input[index + 1] === "'") index += 1
        else quoted = false
      }
      continue
    }
    if (character === "'") quoted = true
    else if (character === '(') depth += 1
    else if (character === ')') depth -= 1
    else if (character === ',' && depth === 0) {
      definitions.push(input.slice(start, index).trim())
      start = index + 1
    }
  }
  const finalDefinition = input.slice(start).trim()
  if (finalDefinition) definitions.push(finalDefinition)
  return definitions
}

function columnsInConstraint(definition) {
  const match = definition.match(/\(([^)]+)\)/)
  if (!match) throw new Error(`Unable to parse constraint columns: ${definition}`)
  return match[1].split(',').map(column => column.trim().replaceAll('"', ''))
}

function parseColumn(definition, tableName) {
  const match = definition.match(/^("?[A-Za-z_][A-Za-z0-9_]*"?)\s+((?:timestamp(?:\s+(?:with(?:out)?\s+time\s+zone))?|timestamptz|character\s+varying(?:\s*\(\s*\d+\s*\))?|varchar(?:\s*\(\s*\d+\s*\))?|bigint|integer|smallint|boolean|text|jsonb|uuid)(?:\s*\[\])?)/i)
  if (!match) throw new Error(`Unsupported PostgreSQL column definition in ${tableName}: ${definition}`)
  const name = match[1].replaceAll('"', '')
  const sourceType = match[2].replace(/\s*\[\]$/, '').replace(/\s*\([^)]*\)/, '').replace(/\s+/g, ' ').toLowerCase()
  if (!supportedTypes.has(sourceType)) throw new Error(`Unsupported PostgreSQL type ${sourceType} in ${tableName}.${name}`)
  const rest = definition.slice(match[0].length)
  const defaultMatch = rest.match(/\bDEFAULT\s+(.+?)(?=\s+(?:NOT\s+NULL|NULL|CONSTRAINT|CHECK|PRIMARY|UNIQUE)\b|$)/i)
  return {
    name,
    sourceType,
    isArray: /\[\]\s*$/i.test(match[2]),
    nullable: !/\bNOT\s+NULL\b/i.test(rest),
    defaultValue: defaultMatch?.[1].trim(),
  }
}

function addConstraint(table, definition) {
  const primary = definition.match(/(?:CONSTRAINT\s+"?[^\s"]+"?\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i)
  if (primary) table.primaryKey = primary[1].split(',').map(column => column.trim().replaceAll('"', ''))
  const unique = definition.match(/(?:CONSTRAINT\s+"?[^\s"]+"?\s+)?UNIQUE\s*\(([^)]+)\)/i)
  if (unique) table.unique.push(unique[1].split(',').map(column => column.trim().replaceAll('"', '')))
}

export function parseSchema(schemaText) {
  const tables = new Map()
  const create = /CREATE TABLE\s+(?:"?[A-Za-z_][A-Za-z0-9_]*"?\.)?"?([A-Za-z_][A-Za-z0-9_]*)"?\s*\(([\s\S]*?)\n\);/gi
  for (const match of schemaText.matchAll(create)) {
    const table = { name: match[1], columns: [], primaryKey: [], unique: [] }
    for (const definition of splitDefinitions(match[2])) {
      if (/^(?:CONSTRAINT|PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY)\b/i.test(definition)) addConstraint(table, definition)
      else table.columns.push(parseColumn(definition, table.name))
    }
    tables.set(table.name, table)
  }
  const altered = /ALTER TABLE ONLY\s+(?:"?[A-Za-z_][A-Za-z0-9_]*"?\.)?"?([A-Za-z_][A-Za-z0-9_]*)"?\s+ADD CONSTRAINT\s+"?[^\s"]+"?\s+((?:PRIMARY\s+KEY|UNIQUE)\s*\([^)]+\));/gi
  for (const match of schemaText.matchAll(altered)) {
    const table = tables.get(match[1])
    if (table) addConstraint(table, match[2])
  }
  if (!tables.size) throw new Error('No PostgreSQL CREATE TABLE statements were found in the schema')
  return tables
}

export function parseCsv(csv) {
  if (!csv.length) return []
  const rows = []
  let row = []
  let value = ''
  let quoted = false
  let fieldWasQuoted = false
  let afterQuote = false
  const pushField = () => {
    row.push({ value, quoted: fieldWasQuoted })
    value = ''
    fieldWasQuoted = false
    afterQuote = false
  }
  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]
    if (quoted) {
      if (character === '"') {
        if (csv[index + 1] === '"') {
          value += '"'
          index += 1
        } else {
          quoted = false
          afterQuote = true
        }
      } else value += character
      continue
    }
    if (afterQuote && character !== ',' && character !== '\n' && character !== '\r') throw new Error('Unexpected character after quoted CSV field')
    if (character === ',' ) pushField()
    else if (character === '\n') pushRow()
    else if (character === '\r') {
      if (csv[index + 1] === '\n') index += 1
      pushRow()
    } else if (character === '"' && value === '' && !afterQuote) {
      quoted = true
      fieldWasQuoted = true
    } else value += character
  }
  if (quoted) throw new Error('Unterminated quoted CSV field')
  if (value !== '' || fieldWasQuoted || row.length) pushRow()
  return rows
}

function readTableCsv(inputDir, table) {
  const file = resolve(inputDir, `${table.name}.csv`)
  const rows = parseCsv(readFileSync(file, 'utf8'))
  if (!rows.length) throw new Error(`CSV dump for ${table.name} is missing its HEADER row: ${file}`)
  const headers = rows[0].map(field => field.value)
  if (new Set(headers).size !== headers.length) throw new Error(`CSV dump for ${table.name} has duplicate headers`)
  const expected = table.columns.map(column => column.name)
  if (headers.length !== expected.length || headers.some((header, index) => header !== expected[index])) {
    throw new Error(`CSV headers for ${table.name} do not match the schema columns`)
  }
  return rows.slice(1).map((fields, rowIndex) => {
    if (fields.length !== headers.length) throw new Error(`CSV row ${rowIndex + 2} for ${table.name} has ${fields.length} fields; expected ${headers.length}`)
    return Object.fromEntries(headers.map((header, index) => [header, fields[index]]))
  })
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function parsePostgresArray(input) {
  let index = 0
  const parseLevel = () => {
    if (input[index] !== '{') throw new Error(`Invalid PostgreSQL array: ${input}`)
    index += 1
    const values = []
    if (input[index] === '}') {
      index += 1
      return values
    }
    while (index < input.length) {
      let value
      if (input[index] === '{') value = parseLevel()
      else if (input[index] === '"') {
        index += 1
        value = ''
        while (index < input.length && input[index] !== '"') {
          if (input[index] === '\\' && index + 1 < input.length) index += 1
          value += input[index]
          index += 1
        }
        if (input[index] !== '"') throw new Error(`Unterminated quoted PostgreSQL array value: ${input}`)
        index += 1
      } else {
        const start = index
        while (index < input.length && input[index] !== ',' && input[index] !== '}') index += 1
        value = input.slice(start, index)
        if (value === 'NULL') value = null
      }
      values.push(value)
      if (input[index] === ',') {
        index += 1
        continue
      }
      if (input[index] === '}') {
        index += 1
        return values
      }
      throw new Error(`Invalid PostgreSQL array: ${input}`)
    }
    throw new Error(`Unterminated PostgreSQL array: ${input}`)
  }
  const result = parseLevel()
  if (index !== input.length) throw new Error(`Unexpected PostgreSQL array suffix: ${input}`)
  return result
}

function timestampToIso(input) {
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?\s*(Z|[+-]\d{2}:?\d{2})?$/i)
  if (!match) throw new Error(`Invalid PostgreSQL timestamp: ${input}`)
  const [, year, month, day, hour, minute, second, fraction = '', zone = 'Z'] = match
  let offset = 0
  if (zone !== 'Z' && zone !== 'z') {
    const sign = zone[0] === '+' ? 1 : -1
    const digits = zone.slice(1).replace(':', '')
    offset = sign * ((Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2))) * 60 * 1000)
  }
  const milliseconds = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)) - offset
  const date = new Date(milliseconds)
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid PostgreSQL timestamp: ${input}`)
  const utc = [date.getUTCFullYear().toString().padStart(4, '0'), (date.getUTCMonth() + 1).toString().padStart(2, '0'), date.getUTCDate().toString().padStart(2, '0')]
  const clock = [date.getUTCHours().toString().padStart(2, '0'), date.getUTCMinutes().toString().padStart(2, '0'), date.getUTCSeconds().toString().padStart(2, '0')]
  return `${utc.join('-')}T${clock.join(':')}${fraction ? `.${fraction}` : ''}Z`
}

export function convertValue(field, column) {
  if (field.value === '' && !field.quoted) return null
  const value = field.value
  if (column.isArray) return canonicalJson(parsePostgresArray(value))
  if (column.sourceType === 'uuid' || column.sourceType === 'text' || column.sourceType === 'character varying' || column.sourceType === 'varchar') return value
  if (column.sourceType === 'jsonb') return canonicalJson(JSON.parse(value))
  if (column.sourceType.startsWith('timestamp') || column.sourceType === 'timestamptz') return timestampToIso(value)
  if (column.sourceType === 'bigint' || column.sourceType === 'integer' || column.sourceType === 'smallint') {
    if (!/^-?\d+$/.test(value)) throw new Error(`Invalid ${column.sourceType} value for ${column.name}: ${value}`)
    return value
  }
  if (column.sourceType === 'boolean') {
    if (/^(?:t|true|1)$/i.test(value)) return '1'
    if (/^(?:f|false|0)$/i.test(value)) return '0'
    throw new Error(`Invalid boolean value for ${column.name}: ${value}`)
  }
  throw new Error(`No conversion for ${column.sourceType}`)
}

function sqliteDefault(column) {
  if (!column.defaultValue || /^nextval\(/i.test(column.defaultValue)) return undefined
  const value = column.defaultValue.replace(/::(?:[A-Za-z_][A-Za-z0-9_]*\s*)+(?:\([^)]*\))?/g, '').trim()
  if (/^(?:now\(\)|current_timestamp)$/i.test(value)) return 'CURRENT_TIMESTAMP'
  if (/^'(?:[^']|'')*'$/.test(value) || /^(?:-?\d+|NULL|true|false)$/i.test(value)) return value
  throw new Error(`Unsupported default for ${column.name}: ${column.defaultValue}`)
}

function createTableSql(table, target) {
  const primaryKey = new Set(table.primaryKey)
  const columnDefinitions = table.columns.map(column => {
    const parts = [quoteIdentifier(column.name), supportedTypes.get(column.sourceType)]
    if (!column.nullable) parts.push('NOT NULL')
    if (table.primaryKey.length === 1 && primaryKey.has(column.name)) parts.push('PRIMARY KEY')
    const defaultValue = sqliteDefault(column)
    if (defaultValue) parts.push(`DEFAULT ${defaultValue}`)
    return parts.join(' ')
  })
  if (table.primaryKey.length > 1) columnDefinitions.push(`PRIMARY KEY (${table.primaryKey.map(quoteIdentifier).join(', ')})`)
  const unique = new Set()
  for (const columns of table.unique) {
    const key = columns.join('\u0000')
    if (!unique.has(key)) {
      unique.add(key)
      columnDefinitions.push(`UNIQUE (${columns.map(quoteIdentifier).join(', ')})`)
    }
  }
  return `CREATE TABLE ${quoteIdentifier(target)} (\n  ${columnDefinitions.join(',\n  ')}\n);`
}

function valueSql(value) {
  return value === null ? 'NULL' : quoteSql(value)
}

function normalizeMappings(schema, mappings) {
  if (!mappings?.length) return [...schema.keys()].map(source => ({ source, target: source }))
  return mappings.map(({ source, target }) => {
    if (!schema.has(source)) throw new Error(`Mapping references table not found in schema: ${source}`)
    quoteIdentifier(target)
    return { source, target }
  })
}

export function generateImport({ inputDir, schemaPath, mappings, batchSize = 250 }) {
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new Error('batchSize must be a positive integer')
  const schema = parseSchema(readFileSync(schemaPath, 'utf8'))
  const selected = normalizeMappings(schema, mappings)
  const tables = selected.map(mapping => {
    const table = schema.get(mapping.source)
    const rows = readTableCsv(inputDir, table).map(row => Object.fromEntries(table.columns.map(column => [column.name, convertValue(row[column.name], column)])))
    return { ...mapping, table, rows }
  })
  const statements = tables.map(({ table, target }) => createTableSql(table, target))
  for (const { table, target, rows } of tables) {
    for (let start = 0; start < rows.length; start += batchSize) {
      const batch = rows.slice(start, start + batchSize)
      statements.push('BEGIN;')
      for (const row of batch) {
        const columns = table.columns.map(column => quoteIdentifier(column.name)).join(', ')
        const values = table.columns.map(column => valueSql(row[column.name])).join(', ')
        statements.push(`INSERT INTO ${quoteIdentifier(target)} (${columns}) VALUES (${values});`)
      }
      statements.push('COMMIT;')
    }
  }
  return { sql: `${statements.join('\n')}\n`, tables }
}

function stableHash(input) {
  let hash = 0xcbf29ce484222325n
  for (const character of input) {
    hash ^= BigInt(character.codePointAt(0))
    hash = BigInt.asUintN(64, hash * 0x100000001b3n)
  }
  return hash.toString(16).padStart(16, '0')
}

function rowIdentity(row, table) {
  const id = row.id
  if (id === undefined || id === null) throw new Error(`Verification requires an id column for ${table.name}`)
  const values = table.columns.map(column => row[column.name] === null ? null : String(row[column.name]))
  return `${String(id)}:${stableHash(canonicalJson(values))}`
}

export function verifyImport({ inputDir, schemaPath, databasePath, mappings }) {
  const schema = parseSchema(readFileSync(schemaPath, 'utf8'))
  const selected = normalizeMappings(schema, mappings)
  const database = new DatabaseSync(databasePath)
  try {
    const tables = selected.map(({ source, target }) => {
      const table = schema.get(source)
      const sourceRows = readTableCsv(inputDir, table).map(row => Object.fromEntries(table.columns.map(column => [column.name, convertValue(row[column.name], column)])))
      const columns = table.columns.map(column => quoteIdentifier(column.name)).join(', ')
      const targetRows = database.prepare(`SELECT ${columns} FROM ${quoteIdentifier(target)}`).all()
      const sourceIdentity = new Set(sourceRows.map(row => rowIdentity(row, table)))
      const targetIdentity = new Set(targetRows.map(row => rowIdentity(row, table)))
      const missing = [...sourceIdentity].filter(identity => !targetIdentity.has(identity))
      const unexpected = [...targetIdentity].filter(identity => !sourceIdentity.has(identity))
      return { source, target, sourceCount: sourceRows.length, targetCount: targetRows.length, missing, unexpected, ok: sourceRows.length === targetRows.length && !missing.length && !unexpected.length }
    })
    return { ok: tables.every(table => table.ok), tables }
  } finally {
    database.close()
  }
}

function parseArguments(args) {
  const options = { mappings: [] }
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--help') options.help = true
    else if (argument === '--input' || argument === '--schema' || argument === '--output' || argument === '--verify' || argument === '--batch-size' || argument === '--map') {
      const value = args[++index]
      if (!value) throw new Error(`${argument} requires a value`)
      if (argument === '--input') options.inputDir = value
      else if (argument === '--schema') options.schemaPath = value
      else if (argument === '--output') options.outputPath = value
      else if (argument === '--verify') options.databasePath = value
      else if (argument === '--batch-size') options.batchSize = Number(value)
      else {
        const [source, target, extra] = value.split(':')
        if (!source || !target || extra) throw new Error('--map must be source:target')
        options.mappings.push({ source, target })
      }
    } else throw new Error(`Unknown argument: ${argument}`)
  }
  return options
}

function usage() {
  return `Usage:\n  node scripts/neon-to-d1.mjs --input <csv-directory> [--schema <schema.sql>] --output <import.sql> [--map source:target] [--batch-size 250]\n  node scripts/neon-to-d1.mjs --input <csv-directory> [--schema <schema.sql>] --verify <imported.sqlite> [--map source:target]\n\nWithout --map, every table declared in the schema is imported to a table with the same name.`
}

function main() {
  const options = parseArguments(process.argv.slice(2))
  if (options.help) {
    console.log(usage())
    return
  }
  if (!options.inputDir) throw new Error('--input is required')
  const inputDir = resolve(options.inputDir)
  const schemaPath = options.schemaPath ? resolve(options.schemaPath) : resolve(inputDir, 'schema.sql')
  if (!options.outputPath && !options.databasePath) throw new Error('Specify --output, --verify, or both')
  const common = { inputDir, schemaPath, mappings: options.mappings, batchSize: options.batchSize ?? 250 }
  if (options.outputPath) {
    const result = generateImport(common)
    writeFileSync(resolve(options.outputPath), result.sql)
    console.log(`Wrote ${options.outputPath} (${result.tables.map(table => `${table.source}=${table.rows.length}`).join(', ')})`)
  }
  if (options.databasePath) {
    const report = verifyImport({ ...common, databasePath: resolve(options.databasePath) })
    console.log(JSON.stringify(report, null, 2))
    if (!report.ok) process.exitCode = 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
