import p from 'node:path'
import { BunPlugin } from 'bun'
import ts from 'typescript'

type TsOptions = {
  declaration: boolean
  emitDeclarationOnly: boolean
  noEmit: boolean
  declarationMap?: boolean
}

type DtsOptions = {
  compiler?: ts.CompilerOptions
  tsconfigPath?: string
  withSourceMap?: boolean
}

export async function generate(entryPoints: string | string[], options?: DtsOptions) {
  const path = p.resolve(options?.tsconfigPath ?? 'tsconfig.json')
  const configJson = ts.readConfigFile(path, ts.sys.readFile).config

  let opts: TsOptions = {
    declaration: true,
    emitDeclarationOnly: true,
    noEmit: false,
  }

  if (options?.withSourceMap) {
    opts = {
      ...opts,
      declarationMap: true,
    }
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

export function dts(options: DtsOptions): BunPlugin {
  return {
    name: 'bun-plugin-dts-auto',
    async setup(build) {
      const entrypoints = [...build.config.entrypoints].sort()
      const tsconfigPath = build.config
      await generate(entrypoints, options)
    },
  }
}

export default dts
