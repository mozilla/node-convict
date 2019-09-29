# Convict-moment

[![NPM version](http://img.shields.io/npm/v/convict-moment.svg)](https://www.npmjs.org/package/convict-moment)

Format 'duration' and 'timestamp' for convict with momentjs.

## Install

```shell
npm install convict-moment
```

## Usage

An example `config.js` file:

```javascript
const convict = require('convict');
const convictMoment = require('convict-moment');

convict.addFormat(require('convict-moment').duration);
convict.addFormat(require('convict-moment').timestamp);

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

Convict will automatically coerce environmental variables from strings to their proper types when importing them. For instance, values with the format `int`, `nat`, `port`, or `Number` will become numbers after a straight forward `parseInt` or `parseFloat`. `duration` and `timestamp` are also parse and converted into numbers, though they utilize [moment.js](http://momentjs.com/) for date parsing.
