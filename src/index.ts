import p from 'node:path'
import process from 'node:process'
import type { BunPlugin } from 'bun'
import ts from 'typescript'

interface TsOptions {
  rootDir: string
  declaration: boolean
  emitDeclarationOnly: boolean
  noEmit: boolean
  declarationMap?: boolean
  outDir?: ts.CompilerOptions['outDir']
  [index: string]: any
}

interface DtsOptions {
  compiler?: ts.CompilerOptions
  tsconfigPath?: string
  cwd?: string
  rootDir?: string
  outdir?: ts.CompilerOptions['outDir'] // sadly, the bundler uses `outdir` instead of `outDir` and to avoid confusion, we'll use `outdir` here
  withSourceMap?: boolean
}

export async function generate(entryPoints: string | string[], options?: DtsOptions) {
  const path = p.resolve(options?.tsconfigPath ?? 'tsconfig.json')
  const configJson = ts.readConfigFile(path, ts.sys.readFile).config

  const opts: TsOptions = {
    rootDir: options?.cwd ?? process.cwd(),
    declaration: true,
    emitDeclarationOnly: true,
    noEmit: false,
    outDir: options?.outdir ?? 'dist/types',
    declarationMap: options?.withSourceMap ?? false,
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configJson,
    ts.sys,
    options?.cwd ?? process.cwd(),
    opts,
    path,
  )

  const host = ts.createCompilerHost(parsedConfig.options)

  const program = ts.createProgram({
    rootNames: Array.isArray(entryPoints) ? entryPoints : [entryPoints],
    options: parsedConfig.options,
    host,
  })

  program.emit()
}

export function dts(options?: DtsOptions): BunPlugin {
  return {
    name: 'bun-plugin-dts-auto',

    async setup(build) {
      const entrypoints = [...build.config.entrypoints].sort()

      await generate(entrypoints, {
        outdir: build.config.outdir,
        ...options,
      })
    },
  }
}

export default dts
