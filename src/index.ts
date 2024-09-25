import p from 'node:path'
import process from 'node:process'
import type { BunPlugin } from 'bun'
import ts from 'typescript'

interface TsOptions {
  rootDir: string
  base: string
  declaration: boolean
  emitDeclarationOnly: boolean
  noEmit: boolean
  declarationMap?: boolean
  outDir?: ts.CompilerOptions['outDir']
  [index: string]: any
}

interface DtsOptions {
  /**
   * The base directory of the source files. If not provided, it
   * will use the current working directory of the process.
   * @default process.cwd()
   */
  base?: string

  /**
   * The TypeScript compiler options. If not provided, it will use
   * the `tsconfig.json` file in the current working directory.
   */
  compiler?: ts.CompilerOptions

  /**
   * The path to the `tsconfig.json` file. If not provided, it will
   * use the `tsconfig.json` file in the current working directory.
   */
  tsconfigPath?: string

  /**
   * The current working directory. If not provided, it will
   * use the current working directory of the process.
   */
  cwd?: string

  /**
   * The root directory of the source files. Please note,
   * it is relative to the current working directory.
   * @default 'src'
   */
  root?: string

  /**
   * The output directory of the declaration files. Please note,
   * it is relative to the current working directory.
   * @default 'dist/types'
   */
  outdir?: ts.CompilerOptions['outDir'] // sadly, the bundler uses `outdir` instead of `outDir` and to avoid confusion, we'll use `outdir` here

  /**
   * The files to include. If not provided, it will include all files in the
   * `tsconfig.json` file, or the Bun build entry points if provided.
   */
  include?: string[]
}

/**
 * Generate declaration files for the TypeScript source files.
 * @param entryPoints The entry points of the TypeScript source files.
 * @param options The options for generating the declaration files.
 */
export async function generate(entryPoints: string | string[], options?: DtsOptions): Promise<void> {
  const path = p.resolve(options?.tsconfigPath ?? 'tsconfig.json')
  const root = (options?.root ?? 'src').replace(/^\.\//, '')

  try {
    const configJson = ts.readConfigFile(path, ts.sys.readFile).config
    const cwd = options?.cwd ?? process.cwd()
    const base = options?.base ?? cwd
    const rootDir = `${cwd}/${root}`

    // Merge the base tsconfig with the package-specific one
    const mergedConfig = {
      ...configJson,
      compilerOptions: {
        ...configJson.compilerOptions,
        ...options?.compiler,
      },
    }

    const opts: TsOptions = {
      base,
      baseUrl: base,
      rootDir,
      declaration: true,
      emitDeclarationOnly: true,
      noEmit: false,
      isolatedDeclarations: undefined,
      ...(options?.include && { include: options.include }),
    }

    const parsedConfig = ts.parseJsonConfigFileContent(mergedConfig, ts.sys, cwd, opts, path)
    parsedConfig.options.emitDeclarationOnly = true

    // Use the outdir from options if provided, otherwise use the one from tsconfig
    const outDir = options?.outdir || parsedConfig.options.outDir || 'dist'

    // Ensure outDir is relative to the package root, not the monorepo root
    parsedConfig.options.outDir = p.resolve(cwd, outDir)

    const host = ts.createCompilerHost(parsedConfig.options)

    // Custom transformers to modify the output path of declaration files
    const customTransformers: ts.CustomTransformers = {
      afterDeclarations: [
        (context) => {
          return (sourceFile) => {
            if ('isDeclarationFile' in sourceFile) {
              const originalFileName = sourceFile.fileName
              const entryPointName = p.basename(originalFileName, '.ts')
              const newFileName = p.join(parsedConfig.options.outDir || 'dist', `${entryPointName}.d.ts`)

              return ts.factory.updateSourceFile(
                sourceFile,
                sourceFile.statements,
                sourceFile.isDeclarationFile,
                sourceFile.referencedFiles,
                sourceFile.typeReferenceDirectives,
                sourceFile.hasNoDefaultLib,
                [{ fileName: newFileName, pos: 0, end: 0 }],
              )
            }
            return sourceFile
          }
        },
      ],
    }

    const program = ts.createProgram({
      rootNames: Array.isArray(entryPoints) ? entryPoints : [entryPoints],
      options: parsedConfig.options,
      host,
    })

    program.emit(
      undefined,
      (fileName, data) => {
        if (fileName.endsWith('.d.ts')) {
          const outputPath = p.join(parsedConfig.options.outDir || 'dist', p.relative(rootDir, fileName))
          try {
            ts.sys.writeFile(outputPath, data)
            // console.log('Successfully wrote file:', outputPath)
          } catch (error) {
            console.error('Error writing file:', outputPath, error)
          }
        }
      },
      undefined,
      true, // Only emit declarations
      customTransformers,
    )
  } catch (error) {
    console.error('Error generating types:', error)
    throw error
  }
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

      await generate(entrypoints, {
        root,
        include: entrypoints,
        outdir: options?.outdir || build.config.outdir,
        cwd: options?.cwd || process.cwd(),
        ...options,
      })
    },
  }
}

export default dts
