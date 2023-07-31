# Bun Plugin - Automatic dts generation

This Bun plugin generates dts files for your TypeScript project.

## ☘️ Features

- 🚗 Automatic dts generation based on your entrypoints

## 🤖 Usage

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
    dts(),
  ],
})

console.log('Build complete ✅')
```

## 🧪 Testing

```bash
bun test
```

## 📈 Changelog

Please see our [releases](https://github.com/stacksjs/bun-plugin-dts-auto/releases) page for more information on what has changed recently.

## 🚜 Contributing

Please review the [Contributing Guide](https://github.com/stacksjs/contributing) for details.

## 🏝 Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/stacks/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## 📄 License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/bun-plugin-dts-auto/tree/main/LICENSE.md) for more information.

Made with ❤️
