import process from 'node:process'
import dts from './src/index'

console.log('Building...')

const result = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'bun',
  sourcemap: 'linked',
  minify: true,
  plugins: [dts()],
})

if (!result.success) {
  console.error('Build failed')

  for (const message of result.logs) {
    // Bun will pretty print the message object
    console.error(message)
  }

  process.exit(1)
}

// eslint-disable-next-line no-console
console.log('Build complete')
