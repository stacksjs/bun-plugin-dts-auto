import process from 'node:process'
import dts from './src/index'

// eslint-disable-next-line no-console
console.log('Building...')

const result = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'bun',

  plugins: [
    dts({
      cwd: import.meta.dir,
    }),
  ],
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
