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
    // console.log('Creating directories:')
    // console.log(`tempDir: ${tempDir}`)
    // console.log(`srcDir: ${srcDir}`)
    // console.log(`outDir: ${outDir}`)

    fs.mkdirSync(tempDir, { recursive: true })
    fs.mkdirSync(srcDir, { recursive: true })
    fs.mkdirSync(outDir, { recursive: true })

    const sampleFile = path.join(srcDir, 'sample.ts')
    // console.log(`Creating sample file: ${sampleFile}`)
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
    // console.log(`Cleaning up temporary directory: ${tempDir}`)
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('should generate declaration files', async () => {
    // console.log('Running: should generate declaration files')
    const inputFile = 'src/sample.ts'
    // console.log(`Input file: ${inputFile}`)
    // console.log(`Generating with options: cwd=${tempDir}, root=src, outdir=dist`)

    await generate(inputFile, {
      cwd: tempDir,
      root: 'src',
      outdir: 'dist',
    })

    const declarationFile = path.join(outDir, 'sample.d.ts')
    // console.log(`Checking for declaration file: ${declarationFile}`)
    // console.log(`File exists: ${fs.existsSync(declarationFile)}`)

    expect(fs.existsSync(declarationFile)).toBe(true)

    if (fs.existsSync(declarationFile)) {
      const content = fs.readFileSync(declarationFile, 'utf-8')
      // console.log('Declaration file content:')
      // console.log(content)
      expect(content).toContain('export interface User')
      expect(content).toContain('export declare function greet(user: User): string')
    }
  })

  it('should handle multiple entry points', async () => {
    const inputFiles = ['src/sample1.ts', 'src/sample2.ts', 'src/sample3.ts']

    // Create sample files
    inputFiles.forEach((file, index) => {
      const filePath = path.join(tempDir, file)
      // console.log(`Creating file: ${filePath}`)
      fs.writeFileSync(
        filePath,
        `
      export const constant${index + 1} = ${index + 1};
      export type MyType${index + 1} = string | number;
      `,
      )
    })

    // console.log('Calling generate function')
    await generate(inputFiles, {
      cwd: tempDir,
      root: 'src',
      outdir: 'dist',
    })

    // console.log('Checking generated files')
    inputFiles.forEach((file) => {
      const declarationFile = path.join(tempDir, 'dist', file.replace(/^src\//, '').replace('.ts', '.d.ts'))
      // console.log(`Checking file: ${declarationFile}`)
      // console.log(`File exists: ${fs.existsSync(declarationFile)}`)
      expect(fs.existsSync(declarationFile)).toBe(true)
      if (fs.existsSync(declarationFile)) {
        const content = fs.readFileSync(declarationFile, 'utf-8')
        // console.log(`File content:\n${content}`)
        expect(content).toContain('export declare const constant')
        expect(content).toContain('export type MyType')
      }
    })
  })

  it('should work as a Bun plugin', async () => {
    // console.log('Running: should work as a Bun plugin')
    const plugin = dts({
      cwd: tempDir,
      root: path.relative(tempDir, srcDir),
      outdir: path.relative(tempDir, outDir),
    })

    expect(plugin.name).toBe('bun-plugin-dts-auto')
    expect(typeof plugin.setup).toBe('function')

    const mockBuild = {
      config: {
        entrypoints: [path.relative(tempDir, path.join(srcDir, 'sample.ts'))],
        root: path.relative(tempDir, srcDir),
        outdir: path.relative(tempDir, outDir),
      },
    }

    // console.log('Setting up plugin with mock build')
    // console.log('Mock build:', JSON.stringify(mockBuild, null, 2))
    await plugin.setup(mockBuild)

    const declarationFile = path.join(outDir, 'sample.d.ts')
    // console.log(`Checking for declaration file: ${declarationFile}`)
    // console.log(`File exists: ${fs.existsSync(declarationFile)}`)

    expect(fs.existsSync(declarationFile)).toBe(true)

    if (fs.existsSync(declarationFile)) {
      const content = fs.readFileSync(declarationFile, 'utf-8')
      // console.log('Declaration file content:')
      // console.log(content)
      expect(content).toContain('export interface User')
      expect(content).toContain('export declare function greet(user: User): string')
    }
  })

  it('should generate declaration files with correct references', async () => {
    // console.log('Running: should generate declaration files with correct references')
    const sampleFile1 = path.join(srcDir, 'sample1.ts')
    const sampleFile2 = path.join(srcDir, 'sample2.ts')

    // console.log(`Creating sample1.ts: ${sampleFile1}`)
    fs.writeFileSync(
      sampleFile1,
      `
    export interface User {
      id: number;
      name: string;
    }
  `,
    )

    // console.log(`Creating sample2.ts: ${sampleFile2}`)
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
    // console.log(
    //   `Generating with options: cwd=${tempDir}, root=${path.relative(tempDir, srcDir)}, outdir=${path.relative(tempDir, outDir)}`,
    // )
    await generate(inputFiles, {
      cwd: tempDir,
      root: path.relative(tempDir, srcDir),
      outdir: path.relative(tempDir, outDir),
    })

    const declarationFile1 = path.join(outDir, 'sample1.d.ts')
    const declarationFile2 = path.join(outDir, 'sample2.d.ts')

    // console.log(`Checking for declaration file 1: ${declarationFile1}`)
    // console.log(`File 1 exists: ${fs.existsSync(declarationFile1)}`)
    // console.log(`Checking for declaration file 2: ${declarationFile2}`)
    // console.log(`File 2 exists: ${fs.existsSync(declarationFile2)}`)

    expect(fs.existsSync(declarationFile1)).toBe(true)
    expect(fs.existsSync(declarationFile2)).toBe(true)

    if (fs.existsSync(declarationFile1) && fs.existsSync(declarationFile2)) {
      const content1 = fs.readFileSync(declarationFile1, 'utf-8')
      const content2 = fs.readFileSync(declarationFile2, 'utf-8')

      // console.log('Declaration file 1 content:')
      // console.log(content1)
      // console.log('Declaration file 2 content:')
      // console.log(content2)

      expect(content1).toContain('export interface User')
      expect(content2).toContain('import { User } from "./sample1"')
      expect(content2).toContain('export declare function greet(user: User): string')
    }
  })
})
