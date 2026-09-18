import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { generateImport, verifyImport } from './neon-to-d1.mjs'

function usage() {
  return 'Usage: node scripts/neon-to-d1-rehearse.mjs --input <snapshot-directory> [--schema <schema.sql>] [--map source:target]'
}

function parseArguments(args) {
  const options = { mappings: [] }
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--help') options.help = true
    else if (argument === '--input' || argument === '--schema' || argument === '--map') {
      const value = args[++index]
      if (!value) throw new Error(`${argument} requires a value`)
      if (argument === '--input') options.inputDir = value
      else if (argument === '--schema') options.schemaPath = value
      else {
        const [source, target, extra] = value.split(':')
        if (!source || !target || extra) throw new Error('--map must be source:target')
        options.mappings.push({ source, target })
      }
    } else if (!argument.startsWith('-') && !options.inputDir) options.inputDir = argument
    else throw new Error(`Unknown argument: ${argument}`)
  }
  return options
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
  const databasePath = resolve(`.n714-d1-rehearsal-${process.pid}.sqlite`)
  if (existsSync(databasePath)) rmSync(databasePath)

  try {
    const generated = generateImport({ inputDir, schemaPath, mappings: options.mappings })
    const database = new DatabaseSync(databasePath)
    try {
      database.exec(generated.sql)
    } finally {
      database.close()
    }
    const report = verifyImport({ inputDir, schemaPath, databasePath, mappings: options.mappings })
    for (const table of report.tables) {
      console.log(`${table.source} -> ${table.target}: source=${table.sourceCount} target=${table.targetCount} identities=${table.ok ? 'pass' : 'fail'}`)
    }
    console.log(`verify: ${report.ok ? 'pass' : 'fail'}`)
    if (!report.ok) process.exitCode = 1
  } finally {
    rmSync(databasePath, { force: true })
  }
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
