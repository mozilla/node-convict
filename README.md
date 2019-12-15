# Node-convict

[![Dependency Status](https://david-dm.org/mozilla/node-convict.svg)](https://david-dm.org/mozilla/node-convict)
[![devDependency Status](https://david-dm.org/mozilla/node-convict/dev-status.svg)](https://david-dm.org/mozilla/node-convict#info=devDependencies)
[![Build Status](https://travis-ci.org/mozilla/node-convict.svg?branch=master)](https://travis-ci.org/mozilla/node-convict)
[![Coverage Status](https://coveralls.io/repos/github/mozilla/node-convict/badge.svg?branch=master)](https://coveralls.io/github/mozilla/node-convict?branch=master)

Convict expands on the standard pattern of configuring node.js applications in a way that is more robust and accessible to collaborators, who may have less interest in digging through imperative code in order to inspect or modify settings. By introducing a configuration schema, convict gives project collaborators more **context** on each setting and enables **validation and early failures** for when configuration goes wrong.

This repository is a collection of packages.

## Packages

 - [convict](/packages/convict/)

  Main package.

 - [convict-format-with-moment](/packages/convict-format-with-moment/)

  Format 'duration' and 'timestamp'.

 - [convict-format-with-validator](/packages/convict-format-with-validator/)

  Format 'email', 'ipaddress' and 'url' for convict.
