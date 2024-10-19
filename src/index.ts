import type { DtsGenerationOption } from '@stacksjs/dtsx'
import type { BunPlugin } from 'bun'
import process from 'node:process'
import { generate } from '@stacksjs/dtsx'

export function dts(options?: DtsGenerationOption): BunPlugin {
  return {
    name: 'bun-plugin-dtsx',

    async setup(build) {
      const cwd = options?.cwd ?? process.cwd()
      const root = options?.root ?? build.config.root ?? './src/'
      const entrypoints = options?.entrypoints ?? ['**/*.ts']
      const outdir = options?.outdir ?? './dist/'
      const keepComments = options?.keepComments ?? true
      const clean = options?.clean ?? false
      const tsconfigPath = options?.tsconfigPath ?? './tsconfig.json'

      await generate({
        ...options,
        cwd,
        root,
        entrypoints,
        outdir,
        keepComments,
        clean,
        tsconfigPath,
      })
    },
  }
}

export type { DtsGenerationOption }

export default dts
