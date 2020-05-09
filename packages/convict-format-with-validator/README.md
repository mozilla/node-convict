# Convict-format-with-validator

[![NPM version](http://img.shields.io/npm/v/convict-format-with-validator.svg)](https://www.npmjs.org/package/convict-format-with-validator)

Formats `email`, `ipaddress` and `url` for convict with [validator.js](https://github.com/validatorjs/validator.js).


## Install

```shellsession
npm install convict-format-with-validator
```


## Usage

An example `config.js` file:

```javascript
const convict = require('convict');
const convict_format_with_validator = require('convict-format-with-validator');

// Add all formats
convict.addFormats(convict_format_with_validator);

// Or add only specific formats:
// convict.addFormat(convict_format_with_validator.ipaddress);
// etc.

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

Validation done through validator.js:

* `email`
* `ipaddress` - IPv4 and IPv6 addresses
* `url`

### Coercion

Convict will automatically coerce environmental variables from strings to their proper types when importing them.
