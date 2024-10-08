# bun-plugin-dts-auto

![Social Card of Bun Plugin DTS Auto](https://github.com/stacksjs/bun-plugin-dts-auto/blob/main/.github/art/cover.jpg)
[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm downloads][npm-downloads-src]][npm-downloads-href]
<!-- [![Codecov][codecov-src]][codecov-href] -->

This Bun plugin generates dts files for your TypeScript projects.

## Features

- Automatic & fast dts generation
- Powered by oxc-transform & isolatedDeclarations
- Monorepo support

## Usage

```bash
bun install -d bun-plugin-dts-auto
```

You may now use the plugin:

```ts
import dts from 'bun-plugin-dts-auto'
// if you prefer named imports
// import { dts } from 'bun-plugin-dts-auto'

await Bun.build({
  root: './src',
  entrypoints: [
    'src/index.ts',
  ],
  outdir: './dist',
  plugins: [
    dts({
      cwd: process.cwd(), // optional
      root: './src', // optional, default: 'src'
      outdir: './dist/types', // optional, default: './dist'
      files: ['src/index.ts'], // optional, if not specified, all .ts files in root will be processed
    }),
  ],
})

console.log('Build complete ✅')
```

## API

The `dts` plugin accepts an options object with the following properties:

- `cwd`: The current working directory _(optional, default: `process.cwd()`)_
- `root`: The root directory of your TypeScript files _(optional, default: `'src'`)_
- `outdir`: The output directory for generated declaration files _(optional, default: `'./dist'`)_
- `files`: An array of file paths or a single file path to process _(optional, if not specified, all `.ts` files in the root directory will be processed)_

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stacksjs/bun-plugin-dts-auto/releases) page for more information on what has changed recently.

## Contributing

Please review the [Contributing Guide](https://github.com/stacksjs/contributing) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/stacks/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

You will always be free to use any of the Stacks OSS software. We would also love to see which parts of the world Stacks ends up in. _Receiving postcards makes us happy—and we will publish them on our website._

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## Credits

Many thanks to the following core technologies & people who have contributed to this package:

- [Oxc](https://oxc.rs/)
- [Chris Breuer](https://github.com/chrisbbreuer)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/bun-plugin-dts-auto/tree/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: <https://img.shields.io/npm/v/bun-plugin-dts-auto?style=flat-square>
[npm-version-href]: <https://npmjs.com/package/bun-plugin-dts-auto>
[npm-downloads-src]: <https://img.shields.io/npm/dm/bun-plugin-dts-auto?style=flat-square>
[npm-downloads-href]: <https://npmjs.com/package/bun-plugin-dts-auto>
[github-actions-src]: <https://img.shields.io/github/actions/workflow/status/stacksjs/bun-plugin-dts-auto/ci.yml?style=flat-square&branch=main>
[github-actions-href]: <https://github.com/stacksjs/bun-plugin-dts-auto/actions?query=workflow%3Aci>

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/bun-plugin-dts-auto/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/bun-plugin-dts-auto -->
