import { spawn } from 'node:child_process'

const procs = []

const run = (command, args, label) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  })

  procs.push(child)

  child.on('exit', (code, signal) => {
    if (signal || code !== 0) {
      for (const proc of procs) {
        if (proc !== child && !proc.killed) {
          proc.kill('SIGTERM')
        }
      }

      if (signal) {
        console.log(`${label} exited with signal ${signal}`)
      } else {
        console.log(`${label} exited with code ${code}`)
      }
      process.exit(code ?? 0)
    }
  })

  return child
}

run('node', ['server/index.mjs'], 'auth')
run('vite', [], 'frontend')

process.on('SIGINT', () => {
  for (const proc of procs) {
    if (!proc.killed) {
      proc.kill('SIGTERM')
    }
  }
  process.exit(0)
})
