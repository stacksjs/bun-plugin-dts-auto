import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import type { DtsOptions } from '../src'
import { dts, generate } from '../src/index'

const tempDir = path.resolve(process.cwd(), 'test-temp')
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

  it('should work as a Bun plugin', async () => {
    const plugin = dts({
      cwd: tempDir,
      root: 'src',
      outdir: 'dist',
    })

    expect(plugin.name).toBe('bun-plugin-dts-auto')
    expect(typeof plugin.setup).toBe('function')

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

  it('should generate declaration files with correct references', async () => {
    const sampleFile1 = path.join(srcDir, 'sample1.ts')
    const sampleFile2 = path.join(srcDir, 'sample2.ts')

    fs.writeFileSync(
      sampleFile1,
      `
    export interface User {
      id: number;
      name: string;
    }
  `,
    )

    fs.writeFileSync(
      sampleFile2,
      `
    import { User } from './sample1';
    export function greet(user: User): string {
      return \`Hello, \${user.name}!\`;
    }
  `,
    )

    await generate([sampleFile1, sampleFile2], {
      cwd: tempDir,
      root: 'src',
      outdir: 'dist',
    })

    const declarationFile1 = path.join(outDir, 'sample1.d.ts')
    const declarationFile2 = path.join(outDir, 'sample2.d.ts')

    expect(fs.existsSync(declarationFile1)).toBe(true)
    expect(fs.existsSync(declarationFile2)).toBe(true)

    const content1 = fs.readFileSync(declarationFile1, 'utf-8')
    const content2 = fs.readFileSync(declarationFile2, 'utf-8')

    // Use a regular expression to match either single or double quotes
    expect(content2).toMatch(/import\s*{\s*User\s*}\s*from\s*['"]\.\/sample1['"]/)
  })

  it('should handle custom compiler options', async () => {
    const customOptions: DtsOptions = {
      cwd: tempDir,
      root: 'src',
      outdir: 'dist',
      compiler: {
        strict: false,
        declaration: true,
        declarationMap: true,
      },
    }

    await generate(path.join(srcDir, 'sample.ts'), customOptions)

    const declarationFile = path.join(outDir, 'sample.d.ts')
    const declarationMapFile = path.join(outDir, 'sample.d.ts.map')

    expect(fs.existsSync(declarationFile)).toBe(true)
    expect(fs.existsSync(declarationMapFile)).toBe(true)

    const content = fs.readFileSync(declarationFile, 'utf-8')
    expect(content).toContain('//# sourceMappingURL=sample.d.ts.map')
  })
})
