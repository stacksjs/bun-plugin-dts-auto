import fs from 'node:fs'
import path from 'node:path'
import type { BunPlugin } from 'bun'
import { isolatedDeclaration } from 'oxc-transform'
import type { DtsOptions } from './types'

export async function generate(options?: DtsOptions): Promise<void> {
  const cwd = options?.cwd ?? process.cwd()
  const root = options?.root ?? 'src'
  const outdir = options?.outdir ?? './dist/'
  const files = options?.files

  const rootDir = path.join(cwd, root)

  if (files) {
    const f = Array.isArray(files) ? files : [files]
    for (const file of f) {
      await processFile(path.join(cwd, file), rootDir, cwd, outdir)
    }
  } else {
    const glob = new Bun.Glob('**/*.ts')
    for await (const file of glob.scan({ cwd: rootDir, absolute: true })) {
      await processFile(file, rootDir, cwd, outdir)
    }
  }
}

async function processFile(file: string, rootDir: string, cwd: string, outdir: string) {
  if (fs.existsSync(file)) {
    const ts = fs.readFileSync(file, 'utf-8')
    const dts = isolatedDeclaration(file, ts, { sourcemap: false })
    const code = dts.code
    const relativePath = path.relative(rootDir, file)
    const outputPath = path.join(cwd, outdir, relativePath.replace(/\.ts$/, '.d.ts'))
    write(outputPath, code)
  } else {
    console.warn(`File not found: ${file}`)
  }
}

function write(file: string, content: string) {
  const dir = path.dirname(file)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(file, content)
}

export function dts(options?: DtsOptions): BunPlugin {
  return {
    name: 'bun-plugin-dts-auto',

    async setup(build) {
      const root = options?.root ?? build.config.root ?? './src/'
      const outdir = options?.outdir ?? './dist/'
      const cwd = options?.cwd ?? process.cwd()
      const files = options?.files

      await generate({
        ...options,
        root,
        outdir,
        cwd,
        files,
      })
    },
  }
}

export * from './types'

export default dts
