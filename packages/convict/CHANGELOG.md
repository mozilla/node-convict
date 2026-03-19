# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.2.5](https://github.com/mozilla/node-convict/compare/v6.2.3...v6.2.5) (2026-03-19)

### Bug Fixes

* Consistent use of quotes in output ([#405](https://github.com/mozilla/node-convict/issues/405)) ([de1629a](https://github.com/mozilla/node-convict/commit/de1629a0d97d33f740a678ccf2ff45ca2f2fd600))
* prevent prototype pollution bypass via String.prototype.startsWith override ([d9a5491](https://github.com/mozilla/node-convict/commit/d9a5491987dcb5aa682cdf911e06ef9f73818d79))
* prevent prototype pollution via load() and loadFile() ([3d7d836](https://github.com/mozilla/node-convict/commit/3d7d83645967a58a722c5702e2bfb372d7da4bbf))
* prevent prototype pollution via schema initialization ([d251c47](https://github.com/mozilla/node-convict/commit/d251c479aef1ad2e4eedc8d73b6eb113204133e7))

## [6.2.4](https://github.com/mozilla/node-convict/compare/v6.2.3...v6.2.4) (2023-01-07)

### Bug Fixes

* Fix imperfect prototype pollution fix (#410) (#411). Thanks to Captain-K-101
