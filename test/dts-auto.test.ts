import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import type { OnLoadResult, PluginBuilder } from 'bun'
import { dts, generate } from '../src/index'

const tempDir = path.resolve(process.cwd(), 'test-temp')
const srcDir = path.join(tempDir, 'src')
const outDir = path.join(tempDir, 'dist')

describe('bun-plugin-dts-auto', () => {
  beforeAll(() => {
    fs.mkdirSync(tempDir, { recursive: true })
    fs.mkdirSync(srcDir, { recursive: true })
    fs.mkdirSync(outDir, { recursive: true })

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
  })

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('should generate declaration files', async () => {
    const inputFile = 'src/sample.ts'

    await generate({
      cwd: tempDir,
      root: 'src',
      outdir: 'dist',
      files: inputFile,
    })

    const declarationFile = path.join(outDir, 'sample.d.ts')
    expect(fs.existsSync(declarationFile)).toBe(true)

    if (fs.existsSync(declarationFile)) {
      const content = fs.readFileSync(declarationFile, 'utf-8')
      expect(content).toContain('export interface User')
      expect(content).toContain('export declare function greet(user: User): string')
    }
  })

  it('should handle multiple files', async () => {
    const inputFiles = ['src/sample1.ts', 'src/sample2.ts', 'src/sample3.ts']

    // Create sample files
    inputFiles.forEach((file, index) => {
      const filePath = path.join(tempDir, file)
      fs.writeFileSync(
        filePath,
        `
      export const constant${index + 1} = ${index + 1};
      export type MyType${index + 1} = string | number;
      `,
      )
    })

    await generate({
      cwd: tempDir,
      root: 'src',
      outdir: 'dist',
      files: inputFiles,
    })

    inputFiles.forEach((file) => {
      const declarationFile = path.join(tempDir, 'dist', file.replace(/^src\//, '').replace('.ts', '.d.ts'))
      expect(fs.existsSync(declarationFile)).toBe(true)
      if (fs.existsSync(declarationFile)) {
        const content = fs.readFileSync(declarationFile, 'utf-8')
        expect(content).toContain('export declare const constant')
        expect(content).toContain('export type MyType')
      }
    })
  })

  it('should work as a Bun plugin', async () => {
    const plugin = dts({
      cwd: tempDir,
      root: path.relative(tempDir, srcDir),
      outdir: path.relative(tempDir, outDir),
    })

    expect(plugin.name).toBe('bun-plugin-dts-auto')
    expect(typeof plugin.setup).toBe('function')

    const mockBuild: PluginBuilder = {
      config: {
        entrypoints: ['path/to/entry'],
        root: 'path/to/root',
        outdir: 'path/to/outdir',
        plugins: [plugin],
      },
      onLoad: () => {},
      onResolve: () => {},
      module: (specifier: string, callback: () => OnLoadResult | Promise<OnLoadResult>) => {
        callback()
      },
    }

    await plugin.setup(mockBuild)

    const declarationFile = path.join(outDir, 'sample.d.ts')
    expect(fs.existsSync(declarationFile)).toBe(true)

    if (fs.existsSync(declarationFile)) {
      const content = fs.readFileSync(declarationFile, 'utf-8')
      expect(content).toContain('export interface User')
      expect(content).toContain('export declare function greet(user: User): string')
    }
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

    const inputFiles = [path.relative(tempDir, sampleFile1), path.relative(tempDir, sampleFile2)]
    await generate({
      cwd: tempDir,
      root: path.relative(tempDir, srcDir),
      outdir: path.relative(tempDir, outDir),
      files: inputFiles,
    })

    const declarationFile1 = path.join(outDir, 'sample1.d.ts')
    const declarationFile2 = path.join(outDir, 'sample2.d.ts')

    expect(fs.existsSync(declarationFile1)).toBe(true)
    expect(fs.existsSync(declarationFile2)).toBe(true)

    if (fs.existsSync(declarationFile1) && fs.existsSync(declarationFile2)) {
      const content1 = fs.readFileSync(declarationFile1, 'utf-8')
      const content2 = fs.readFileSync(declarationFile2, 'utf-8')

      expect(content1).toContain('export interface User')
      expect(content2).toContain('import { User } from "./sample1"')
      expect(content2).toContain('export declare function greet(user: User): string')
    }
  })

  it('should generate declaration files for all files in root when no files are specified', async () => {
    // Create additional sample files
    const additionalFiles = ['src/extra1.ts', 'src/extra2.ts']
    additionalFiles.forEach((file, index) => {
      const filePath = path.join(tempDir, file)
      fs.writeFileSync(
        filePath,
        `
      export const extraConstant${index + 1} = ${index + 1};
      export type ExtraType${index + 1} = boolean | null;
      `,
      )
    })

    await generate({
      cwd: tempDir,
      root: 'src',
      outdir: 'dist',
    })

    const allFiles = [...additionalFiles, 'src/sample.ts', 'src/sample1.ts', 'src/sample2.ts', 'src/sample3.ts']
    allFiles.forEach((file) => {
      const declarationFile = path.join(tempDir, 'dist', file.replace(/^src\//, '').replace('.ts', '.d.ts'))
      expect(fs.existsSync(declarationFile)).toBe(true)
    })
  })
})
