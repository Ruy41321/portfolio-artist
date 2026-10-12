// Starts the production build like the Docker image does: the standalone server
// with its static assets copied next to it. Usage: pnpm build && pnpm start [-p PORT]
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const standalone = path.join(root, '.next', 'standalone')
if (!fs.existsSync(path.join(standalone, 'server.js'))) {
  console.error('No standalone build found: run `pnpm build` first.')
  process.exit(1)
}

// Start with an empty page/data cache, like a freshly created container.
for (const dir of ['cache', 'server/route-cache']) {
  fs.rmSync(path.join(standalone, '.next', dir), { recursive: true, force: true })
}

fs.cpSync(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'), {
  recursive: true,
})
if (fs.existsSync(path.join(root, 'public'))) {
  fs.cpSync(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true })
}

const portFlag = process.argv.indexOf('-p')
const port = portFlag > -1 ? process.argv[portFlag + 1] : process.env.PORT || '3000'

const child = spawn(process.execPath, ['server.js'], {
  cwd: standalone,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: port,
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
    MEDIA_DIR: process.env.MEDIA_DIR || path.join(root, 'media'),
  },
})
child.on('exit', (code) => process.exit(code ?? 0))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
