# Node-convict

[![Dependency Status](https://david-dm.org/mozilla/node-convict.svg)](https://david-dm.org/mozilla/node-convict)
[![devDependency Status](https://david-dm.org/mozilla/node-convict/dev-status.svg)](https://david-dm.org/mozilla/node-convict#info=devDependencies)
[![Build Status](https://travis-ci.org/mozilla/node-convict.svg?branch=master)](https://travis-ci.org/mozilla/node-convict)
[![Coverage Status](https://coveralls.io/repos/github/mozilla/node-convict/badge.svg?branch=master)](https://coveralls.io/github/mozilla/node-convict?branch=master)

Convict expands on the standard pattern of configuring node.js applications in a
way that is more robust and accessible to collaborators, who may have less
interest in digging through code in order to inspect or modify settings. By
introducing a configuration schema, convict gives project collaborators more
**context** on each setting and enables **validation and early failures** for
when configuration goes wrong.

:warning: Convict repository and NPM package are presently undergoing a big
transition from single package (up to convict@5.x) to multi-package structure
(beginning with convict@6).

See https://www.npmjs.com/package/convict for convict@5.x documentation


This repository is a collection of the following packages.

## Packages

 - [convict](/packages/convict/) :
   the main package

 - [convict-format-with-moment](/packages/convict-format-with-moment/) :
   the optional package providing the `duration` and `timestamp` formats

 - [convict-format-with-validator](/packages/convict-format-with-validator/)
   the optional package providing the `email`, `ipaddress` and `url` formats
