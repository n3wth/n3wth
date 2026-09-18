import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { generateImport, parseSchema, verifyImport } from './neon-to-d1.mjs'

const fixtures = resolve('scripts/test-fixtures/n714')
const schemaPath = resolve(fixtures, 'schema.sql')
let databaseSequence = 0

function createImportedDatabase(t, mappings) {
  const databasePath = resolve(`.n714-neon-to-d1-test-${process.pid}-${databaseSequence += 1}.sqlite`)
  if (existsSync(databasePath)) rmSync(databasePath)
  const result = generateImport({ inputDir: fixtures, schemaPath, mappings, batchSize: 1 })
  const database = new DatabaseSync(databasePath)
  database.exec(result.sql)
  t.after(() => {
    database.close()
    rmSync(databasePath, { force: true })
  })
  return { database, databasePath, result }
}

test('converts PostgreSQL types and preserves UUIDs, timestamps, and JSON', t => {
  const { database, result } = createImportedDatabase(t, [
    { source: 'examples', target: 'examples_d1' },
    { source: 'empty_records', target: 'empty_records_d1' },
  ])
  const row = database.prepare('SELECT * FROM "examples_d1"').get()

  assert.match(result.sql, /UNIQUE \("note", "count"\)/)
  assert.equal(row.id, '11111111-2222-4333-8444-555555555555')
  assert.equal(row.occurred_at, '2025-01-02T01:04:05.123456Z')
  assert.equal(row.recorded_at, '2025-01-02T03:04:05.654321Z')
  assert.equal(row.total, 900719925474099)
  assert.equal(row.count, 42)
  assert.equal(row.enabled, 1)
  assert.equal(row.note, 'synthetic note')
  assert.equal(row.labels, '["first","second"]')
  assert.equal(row.payload, '{"a":{"a":1,"b":2},"z":1}')
  assert.deepEqual(JSON.parse(row.payload), { a: { a: 1, b: 2 }, z: 1 })
  assert.deepEqual(JSON.parse(row.labels), ['first', 'second'])
  assert.equal(database.prepare('SELECT count(*) AS count FROM "empty_records_d1"').get().count, 0)
})

test('emits a SQLite UNIQUE constraint that rejects duplicate source keys', t => {
  const { sql } = generateImport({
    inputDir: fixtures,
    schemaPath,
    mappings: [{ source: 'unique_records', target: 'unique_records_d1' }],
  })
  const database = new DatabaseSync(':memory:')
  t.after(() => database.close())
  assert.throws(() => database.exec(sql), /UNIQUE constraint failed/)
})

test('verifyImport passes when counts and every row identity match', t => {
  const { databasePath } = createImportedDatabase(t, [
    { source: 'examples', target: 'examples_d1' },
    { source: 'empty_records', target: 'empty_records_d1' },
  ])
  const report = verifyImport({
    inputDir: fixtures,
    schemaPath,
    databasePath,
    mappings: [
      { source: 'examples', target: 'examples_d1' },
      { source: 'empty_records', target: 'empty_records_d1' },
    ],
  })
  assert.equal(report.ok, true)
  assert.deepEqual(report.tables.map(table => [table.sourceCount, table.targetCount, table.missing.length, table.unexpected.length]), [[1, 1, 0, 0], [0, 0, 0, 0]])
})

test('verifyImport fails when an imported row changes', t => {
  const { database, databasePath } = createImportedDatabase(t, [{ source: 'examples', target: 'examples_d1' }])
  database.exec('UPDATE "examples_d1" SET "note" = \'changed synthetic note\'')
  const report = verifyImport({
    inputDir: fixtures,
    schemaPath,
    databasePath,
    mappings: [{ source: 'examples', target: 'examples_d1' }],
  })
  assert.equal(report.ok, false)
  assert.equal(report.tables[0].sourceCount, 1)
  assert.equal(report.tables[0].targetCount, 1)
  assert.equal(report.tables[0].missing.length, 1)
  assert.equal(report.tables[0].unexpected.length, 1)
})

test('schema parser retains primary and unique constraints', () => {
  const schema = parseSchema(`CREATE TABLE public.records (\n  id integer NOT NULL,\n  external_id uuid NOT NULL,\n  CONSTRAINT records_pkey PRIMARY KEY (id),\n  CONSTRAINT records_external_id_key UNIQUE (external_id)\n);`)
  assert.deepEqual(schema.get('records').primaryKey, ['id'])
  assert.deepEqual(schema.get('records').unique, [['external_id']])
})
