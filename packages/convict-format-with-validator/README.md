# Convict-validator

[![NPM version](http://img.shields.io/npm/v/convict-format-with-validator.svg)](https://www.npmjs.org/package/convict-format-with-validator)

Format 'email', 'ipaddress' and 'url' for convict with validatorjs.

# Convict-format-with-validator

[![NPM version](http://img.shields.io/npm/v/convict-format-with-validator.svg)](https://www.npmjs.org/package/convict-format-with-validator)

[validator.js](https://github.com/validatorjs/validator.js) formats for convict.


## Install

```shellsession
npm install convict-format-with-validator
```


## Usage

An example `config.js` file:

```javascript
const convict = require('convict');

convict.addFormat(require('convict-format-with-validator').ipaddress);
convict.addFormat(require('convict-format-with-validator').port);

// or :
// convict.addFormats(require('convict-format-with-validator'));

// Define a schema
var config = convict({
  ip: {
    doc: 'The IP address to bind.',
    format: 'ipaddress',
    default: '127.0.0.1',
    env: 'IP_ADDRESS',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8080,
    env: 'PORT',
    arg: 'port'
  }
});
```

### Validation

Use [validator.js](https://github.com/chriso/node-validator#list-of-validation-methods) to validate:

* `email`
* `ipaddress` - IPv4 and IPv6 addresses
* `url`

### Coercion

Convict will automatically coerce environmental variables from strings to their proper types when importing them.
