# Convict-moment

[![NPM version](http://img.shields.io/npm/v/convict-format-with-moment.svg)](https://www.npmjs.org/package/convict-format-with-moment)

Format 'duration' and 'timestamp' for convict with momentjs.

## Install

```shell
npm install convict-format-with-moment
```

## Usage

An example `config.js` file:

```javascript
const convict = require('convict');

convict.addFormat(require('convict-format-with-moment').duration);
convict.addFormat(require('convict-format-with-moment').timestamp);

// Define a schema
var config = convict({
  format: {
    format: 'duration'
  },
  format: {
    format: 'timestamp'
  }
});
```

### Validation

Use [moment.js](http://momentjs.com/) to validate:

* `duration` - milliseconds or a human readable string (e.g. 3000, "5 days")
* `timestamp` - Unix timestamps or date strings recognized by [moment.js](http://momentjs.com/)

### Coercion

Convict will automatically coerce strings variables to their proper types when importing them. `duration` and `timestamp` are also parse and converted into numbers, though they utilize [moment.js](http://momentjs.com/) for date parsing.
