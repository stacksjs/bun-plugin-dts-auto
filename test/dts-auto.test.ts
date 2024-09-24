import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import { dts, generate } from '../src/index'

const tempDir = path.join(process.cwd(), 'test-temp')
const srcDir = path.join(tempDir, 'src')
const outDir = path.join(tempDir, 'dist')

describe('bun-plugin-dts-auto', () => {
  beforeAll(() => {
    // Create temporary directories
    fs.mkdirSync(tempDir, { recursive: true })
    fs.mkdirSync(srcDir, { recursive: true })
    fs.mkdirSync(outDir, { recursive: true })

    // Create a sample TypeScript file
    const sampleFile = path.join(srcDir, 'sample.ts')
    fs.writeFileSync(
      sampleFile,
      `
      export interface User {
        id: number;
        name: string;
      }

      export function greet(user: User): string {
        return \`Hello, \${user.name}!\`;
      }
    `,
    )

    // Create a tsconfig.json file
    const tsconfigPath = path.join(tempDir, 'tsconfig.json')
    fs.writeFileSync(
      tsconfigPath,
      JSON.stringify({
        compilerOptions: {
          target: 'es2017',
          module: 'esnext',
          strict: true,
          esModuleInterop: true,
          outDir: 'dist',
          declaration: true,
        },
        include: ['src/**/*'],
      }),
    )
  })

  afterAll(() => {
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('should generate declaration files', async () => {
    await generate(path.join(srcDir, 'sample.ts'), {
      cwd: tempDir,
      root: 'src',
      outdir: 'dist',
    })

    const declarationFile = path.join(outDir, 'sample.d.ts')
    expect(fs.existsSync(declarationFile)).toBe(true)

    const content = fs.readFileSync(declarationFile, 'utf-8')

    // Check for the interface declaration
    expect(content).toContain('export interface User {')
    expect(content).toContain('id: number;')
    expect(content).toContain('name: string;')

    // Check for the function declaration
    expect(content).toContain('export declare function greet(user: User): string;')

    // Optionally, check for the reference comment and source map
    expect(content).toContain('/// <reference')
    expect(content).toContain('//# sourceMappingURL=sample.d.ts.map')
  })

  it('should work as a Bun plugin', async () => {
    const plugin = dts({
      cwd: tempDir,
      root: 'src',
      outdir: 'dist',
    })

    expect(plugin.name).toBe('bun-plugin-dts-auto')
    expect(typeof plugin.setup).toBe('function')

    // Mock the build object
    const mockBuild = {
      config: {
        entrypoints: [path.join(srcDir, 'sample.ts')],
        root: 'src',
        outdir: 'dist',
      },
    }

    // @ts-ignore: Argument of type '{ config: { entrypoints: string[]; root: string; outdir: string; }; }' is not assignable to parameter of type 'PluginBuilder'.
    await plugin.setup(mockBuild)

    const declarationFile = path.join(outDir, 'sample.d.ts')
    expect(fs.existsSync(declarationFile)).toBe(true)
  })
})
