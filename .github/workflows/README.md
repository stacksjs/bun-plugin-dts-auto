# GitHub Actions

This folder contains the following GitHub Actions:

- [CI][CI] - all CI jobs for the project
  - lints the code
  - `typecheck`s the code
  - automatically fixes & applies code style updates
  - runs test suite
  - runs on `ubuntu-latest` with `node-versions` set to `[16x, 18x]`
- [Release][Release] - automates the release process & changelog generation
- [Lock Closed Issues][Lock Closed Issues] - Locks all closed issues after 14 days of being closed

[CI]: ./workflows/ci.yml
[Release]: ./workflows/release.yml
[Lock Closed Issues]: ./workflows/lock-closed-issues.yml
