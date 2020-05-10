# Node-convict

[![Build Status](https://travis-ci.org/mozilla/node-convict.svg?branch=master)](https://travis-ci.org/mozilla/node-convict)
[![Coverage Status](https://coveralls.io/repos/github/mozilla/node-convict/badge.svg?branch=master)](https://coveralls.io/github/mozilla/node-convict?branch=master)

Convict expands on the standard pattern of configuring node.js applications in a
way that is more robust and accessible to collaborators, who may have less
interest in digging through code in order to inspect or modify settings. By
introducing a configuration schema, convict gives project collaborators more
**context** on each setting and enables **validation and early failures** for
when configuration goes wrong.

This repository is a monorepo for the following packages managed through
[Lerna](https://lerna.js.org/).


## Packages

* [convict](/packages/convict/) :
  the main package

* [convict-format-with-validator](/packages/convict-format-with-validator/)
  the optional package providing the `email`, `ipaddress` and `url` formats

* [convict-format-with-moment](/packages/convict-format-with-moment/) :
  the optional package providing the `duration` and `timestamp` formats


## Migrating

* [Migrating from Convict 5 to 6](/packages/convict/MIGRATING_FROM_CONVICT_5_TO_6.md)


## Contributing

Read the [Contributing](./CONTRIBUTING.md) doc.
