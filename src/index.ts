import p from 'node:path'
import process from 'node:process'
import type { BunPlugin } from 'bun'
import ts from 'typescript'

interface TsOptions {
  declaration: boolean
  emitDeclarationOnly: boolean
  noEmit: boolean
  declarationMap?: boolean
  [index: string]: any
}

interface DtsOptions {
  compiler?: ts.CompilerOptions
  tsconfigPath?: string
  withSourceMap?: boolean
  outDir?: string
}

export async function generate(entryPoints: string | string[], options?: DtsOptions) {
  const path = p.resolve(options?.tsconfigPath ?? 'tsconfig.json')
  const configJson = ts.readConfigFile(path, ts.sys.readFile).config

  const opts: TsOptions = {
    declaration: true,
    emitDeclarationOnly: true,
    noEmit: false,
    outDir: options?.outDir ?? 'dist/types',
    declarationMap: options?.withSourceMap ?? false,
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configJson,
    ts.sys,
    process.cwd(),
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
      await generate(entrypoints, options)
    },
  }
}

export default dts
