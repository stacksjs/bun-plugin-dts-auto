import fs from 'node:fs'
import path from 'node:path'
import type { BunPlugin } from 'bun'
import { isolatedDeclaration } from 'oxc-transform'
import type { DtsOptions } from './types'

export async function generate(options?: DtsOptions): Promise<void> {
  const cwd = options?.cwd ?? process.cwd()
  const root = options?.root ?? 'src'
  const outdir = options?.outdir ?? './dist/'

  const glob = new Bun.Glob('**/*.ts')
  const rootDir = path.join(cwd, root)

  for await (const file of glob.scan({ cwd: rootDir, absolute: true })) {
    // console.log(`Processing file: ${file}`)

    if (fs.existsSync(file)) {
      const ts = fs.readFileSync(file, 'utf-8')
      const dts = isolatedDeclaration(file, ts, { sourcemap: false })
      const code = dts.code
      const relativePath = path.relative(rootDir, file)
      const outputPath = path.join(cwd, outdir, relativePath.replace(/\.ts$/, '.d.ts'))
      // console.log(`Writing declaration file: ${outputPath}`)
      write(outputPath, code)
    } else {
      console.warn(`File not found: ${file}`)
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
      // const entrypoints = [...build.config.entrypoints].sort()
      const root = options?.root ?? build.config.root ?? './src/'
      const outdir = options?.outdir ?? './dist/'
      const cwd = options?.cwd ?? process.cwd()

      await generate({
        ...options,
        root,
        outdir,
        cwd,
      })
    },
  }
}

export * from './types'

export default dts
