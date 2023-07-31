import p from 'node:path'
import { BunPlugin } from 'bun'
import ts from 'typescript'

export type Options = {
  compiler?: ts.CompilerOptions
  tsconfigPath?: string
}

export async function generate(entryPoints: string | string[], options?: Options) {
  const path = p.resolve(options?.tsconfigPath ?? 'tsconfig.json')
  const configJson = ts.readConfigFile(path, ts.sys.readFile).config

  const parsedConfig = ts.parseJsonConfigFileContent(
    configJson,
    ts.sys,
    process.cwd(),
    { declaration: true, emitDeclarationOnly: true, noEmit: false },
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

export function dts(): BunPlugin {
  return {
    name: 'bun-plugin-dts-auto',
    async setup(build) {
      const entrypoints = [...build.config.entrypoints].sort()
      const tsconfigPath = build.config
      await generate(entrypoints)
    },
  }
}

export default dts
