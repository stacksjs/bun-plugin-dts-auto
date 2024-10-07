function requireNative() {
  const loadErrors = []

  if (process.platform === 'android') {
    if (process.arch === 'arm64') {
      try {
        return import.meta.require('../node_modules/@oxc-transform/binding-android-arm64/transform.android-arm64.node')
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return import.meta.require('@oxc-transform/binding-android-arm64')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 'arm') {
      try {
        return import.meta.require(
          '../node_modules/@oxc-transform/binding-android-arm-eabi/transform.android-arm-eabi.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return import.meta.require('@oxc-transform/binding-android-arm-eabi')
      } catch (e) {
        loadErrors.push(e)
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on Android ${process.arch}`))
    }
  } else if (process.platform === 'win32') {
    if (process.arch === 'x64') {
      try {
        return import.meta.require(
          '../node_modules/@oxc-transform/binding-win32-x64-msvc/transform.win32-x64-msvc.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return import.meta.require('@oxc-transform/binding-win32-x64-msvc')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 'ia32') {
      try {
        return import.meta.require(
          '../node_modules/@oxc-transform/binding-win32-ia32-msvc/transform.win32-ia32-msvc.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return import.meta.require('@oxc-transform/binding-win32-ia32-msvc')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 'arm64') {
      try {
        return import.meta.require(
          '../node_modules/@oxc-transform/binding-win32-arm64-msvc/transform.win32-arm64-msvc.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }
      try {
        return import.meta.require('@oxc-transform/binding-win32-arm64-msvc')
      } catch (e) {
        loadErrors.push(e)
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on Windows: ${process.arch}`))
    }
  } else if (process.platform === 'darwin') {
    try {
      return import.meta.require(
        '../node_modules/@oxc-transform/binding-darwin-universal/transform.darwin-universal.node',
      )
    } catch (e) {
      loadErrors.push(e)
    }

    try {
      return import.meta.require('@oxc-transform/binding-darwin-universal')
    } catch (e) {
      loadErrors.push(e)
    }

    if (process.arch === 'x64') {
      try {
        return import.meta.require('../node_modules/@oxc-transform/binding-darwin-x64/transform.darwin-x64.node')
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-darwin-x64')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 'arm64') {
      try {
        return import.meta.require('../node_modules/@oxc-transform/binding-darwin-arm64/transform.darwin-arm64.node')
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-darwin-arm64')
      } catch (e) {
        loadErrors.push(e)
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on macOS: ${process.arch}`))
    }
  } else if (process.platform === 'freebsd') {
    if (process.arch === 'x64') {
      try {
        return import.meta.require('../node_modules/@oxc-transform/binding-freebsd-x64/transform.freebsd-x64.node')
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-freebsd-x64')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 'arm64') {
      try {
        return import.meta.require('../node_modules/@oxc-transform/binding-freebsd-arm64/transform.freebsd-arm64.node')
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-freebsd-arm64')
      } catch (e) {
        loadErrors.push(e)
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on FreeBSD: ${process.arch}`))
    }
  } else if (process.platform === 'linux') {
    if (process.arch === 'x64') {
      if (isMusl()) {
        try {
          return import.meta.require(
            '../node_modules/@oxc-transform/binding-linux-x64-musl/transform.linux-x64-musl.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-x64-musl')
        } catch (e) {
          loadErrors.push(e)
        }
      } else {
        try {
          return import.meta.require(
            '../node_modules/@oxc-transform/binding-linux-x64-gnu/transform.linux-x64-gnu.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-x64-gnu')
        } catch (e) {
          loadErrors.push(e)
        }
      }
    } else if (process.arch === 'arm64') {
      if (isMusl()) {
        try {
          return import.meta.require(
            '../node_modules/@oxc-transform/binding-linux-arm64-musl/transform.linux-arm64-musl.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-arm64-musl')
        } catch (e) {
          loadErrors.push(e)
        }
      } else {
        try {
          return import.meta.require(
            '../node_modules/@oxc-transform/binding-linux-arm64-gnu/transform.linux-arm64-gnu.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-arm64-gnu')
        } catch (e) {
          loadErrors.push(e)
        }
      }
    } else if (process.arch === 'arm') {
      if (isMusl()) {
        try {
          return import.meta.require(
            '../node_modules/@oxc-transform/binding-linux-arm-musleabihf/transform.linux-arm-musleabihf.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-arm-musleabihf')
        } catch (e) {
          loadErrors.push(e)
        }
      } else {
        try {
          return import.meta.require(
            '../node_modules/@oxc-transform/binding-linux-arm-gnueabihf/transform.linux-arm-gnueabihf.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-arm-gnueabihf')
        } catch (e) {
          loadErrors.push(e)
        }
      }
    } else if (process.arch === 'riscv64') {
      if (isMusl()) {
        try {
          return import.meta.require(
            '../node_modules/@oxc-transform/binding-linux-riscv64-musl/transform.linux-riscv64-musl.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-riscv64-musl')
        } catch (e) {
          loadErrors.push(e)
        }
      } else {
        try {
          return import.meta.require(
            '../node_modules/@oxc-transform/binding-linux-riscv64-gnu/transform.linux-riscv64-gnu.node',
          )
        } catch (e) {
          loadErrors.push(e)
        }

        try {
          return import.meta.require('@oxc-transform/binding-linux-riscv64-gnu')
        } catch (e) {
          loadErrors.push(e)
        }
      }
    } else if (process.arch === 'ppc64') {
      try {
        return import.meta.require(
          '../node_modules/@oxc-transform/binding-linux-ppc64-gnu/transform.linux-ppc64-gnu.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-linux-ppc64-gnu')
      } catch (e) {
        loadErrors.push(e)
      }
    } else if (process.arch === 's390x') {
      try {
        return import.meta.require(
          '../node_modules/@oxc-transform/binding-linux-s390x-gnu/transform.linux-s390x-gnu.node',
        )
      } catch (e) {
        loadErrors.push(e)
      }

      try {
        return import.meta.require('@oxc-transform/binding-linux-s390x-gnu')
      } catch (e) {
        loadErrors.push(e)
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on Linux: ${process.arch}`))
    }
  } else {
    loadErrors.push(new Error(`Unsupported OS: ${process.platform}, architecture: ${process.arch}`))
  }
}
