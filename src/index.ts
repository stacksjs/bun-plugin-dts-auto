import fs from 'node:fs'
import p from 'node:path'
import path from 'node:path'
import type { BunPlugin } from 'bun'
import { isolatedDeclaration } from 'oxc-transform'

export interface DtsOptions {
  cwd?: string
  root?: string
  outdir?: string
  // sourcemap?: boolean
}

export async function generate(entryPoints: string | string[], options?: DtsOptions): Promise<void> {
  // console.log('Generate function called with:')
  // console.log('EntryPoints:', entryPoints)
  // console.log('Options:', options)

  const files = Array.isArray(entryPoints) ? entryPoints : [entryPoints]
  const cwd = options?.cwd ?? process.cwd()
  const root = options?.root ?? 'src'
  const outdir = options?.outdir ?? './dist/'

  // console.log('Resolved options:')
  // console.log('CWD:', cwd)
  // console.log('Root:', root)
  // console.log('Outdir:', outdir)

  for (const file of files) {
    const fullPath = path.join(cwd, file)
    // console.log(`Processing file: ${fullPath}`)

    if (fs.existsSync(fullPath)) {
      const ts = fs.readFileSync(fullPath, 'utf-8')
      const dts = isolatedDeclaration(fullPath, ts, { sourcemap: false })
      const code = dts.code
      const relativePath = path.relative(path.join(cwd, root), fullPath)
      const outputPath = path.join(cwd, outdir, relativePath.replace(/\.ts$/, '.d.ts'))
      // console.log(`Writing declaration file: ${outputPath}`)
      write(outputPath, code)
    } else {
      console.warn(`File not found: ${fullPath}`)
    }
  }
}

function write(file: string, content: string) {
  const dir = path.dirname(file)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(file, content)
  // console.log(`File written: ${file}`)
}

/**
 * A Bun plugin to generate declaration files for the TypeScript source files.
 * @param options The options for generating the declaration files.
 */
export function dts(options?: DtsOptions): BunPlugin {
  return {
    name: 'bun-plugin-dts-auto',

    async setup(build) {
      const entrypoints = [...build.config.entrypoints].sort()
      const root = options?.root ?? build.config.root ?? 'src'
      const outdir = options?.outdir ?? './dist/'
      const cwd = options?.cwd ?? process.cwd()

      await generate(entrypoints, {
        ...options,
        root,
        outdir,
        cwd,
      })
    },
  }
}

export default dts
