import path from 'node:path'
import process from 'node:process'
import dts from './src/index'
// import dts from './dist/index'

console.log('Building...')

const result = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'bun',
  // sourcemap: 'linked',
  // minify: true,
  plugins: [dts()],
})

if (!result.success) {
  console.error('Build failed')

  for (const message of result.logs) {
    console.error(message)
  }

  process.exit(1)
}

// need to replace requireNative() function with the one from the binding
// because the bundler will adjust the bindings based on who bundles

// Copy requireNative() function from stubs.js to dist/index.js
const stubsPath = path.join(process.cwd(), 'src', 'stubs.txt')
const distIndexPath = path.join(process.cwd(), 'dist', 'index.js')

const stubsContent = await Bun.file(stubsPath).text()
let distIndexContent = await Bun.file(distIndexPath).text()

// Extract requireNative function from stubs.js
const requireNativeRegex = /function requireNative\(\) {[\s\S]*?^}/m
const stubsRequireNative = stubsContent.match(requireNativeRegex)?.[0]

// Replace requireNative function in dist/index.js
const distRequireNativeRegex = /function requireNative\(\) {[\s\S]*?^}/m
distIndexContent = distIndexContent.replace(distRequireNativeRegex, stubsRequireNative as string)

// Write the modified content back to dist/index.js
await Bun.write(distIndexPath, distIndexContent)
console.log('Updated requireNative() function in dist/index.js')

// eslint-disable-next-line no-console
console.log('Build complete')
