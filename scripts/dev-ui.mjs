import { spawn, spawnSync } from 'node:child_process'

const build = spawnSync('npm', ['run', 'build', '-w', '@n3wth/ui'], { stdio: 'inherit' })
if (build.status !== 0) process.exit(build.status ?? 1)

const children = [
  spawn('npm', ['run', 'dev', '-w', '@n3wth/ui'], { stdio: 'inherit' }),
  spawn('npm', ['run', 'dev', '-w', '@n3wth/ui-docs'], { stdio: 'inherit' }),
]
let stopping = false
function stop(code) {
  if (stopping) return
  stopping = true
  for (const child of children) child.kill('SIGTERM')
  process.exitCode = code
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop(0))
for (const child of children) {
  child.on('error', () => stop(1))
  child.on('exit', (code) => stop(code ?? 1))
}
