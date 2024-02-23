![Social Card of Bun Plugin DTS Auto](./.github/art/cover.jpg)

# bun-plugin-dts-auto

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm downloads][npm-downloads-src]][npm-downloads-href]
<!-- [![Codecov][codecov-src]][codecov-href] -->

This Bun plugin generates dts files for your TypeScript project.

## Features

- Automatic dts generation based on your entrypoints
- Support for source map generations
- Honors & inherits your `tsconfig.json` settings

## Usage

```bash
bun install -d bun-plugin-dts-auto
```

You may now use the plugin:

```ts
import dts from 'bun-plugin-dts-auto'

await Bun.build({
  entrypoints: [
    'src/index.ts',
  ],

  outdir: './dist',

  plugins: [
    dts({
      withSourceMap: true, // optional
    }),
  ],
})

console.log('Build complete ✅')
```

> [!NOTE]
> Please note, this plugin honors your `tsconfig.json` settings (e.g. `compilerOptions.outDir`).

## 🧪 Testing

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
