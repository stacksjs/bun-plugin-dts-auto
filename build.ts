import dts from './src/index'

await Bun.build({
  entrypoints: [
    'src/index.ts',
  ],
  outdir: './dist',
  external: [
    'typescript',
    'bun',
    'node:path'
  ],
  plugins: [
    dts(),
  ],
})

console.log('Build complete ✅')
