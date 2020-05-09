# Convict-format-with-moment

[![NPM version](http://img.shields.io/npm/v/convict-format-with-moment.svg)](https://www.npmjs.org/package/convict-format-with-moment)

Formats `duration` and `timestamp` for convict with [Moment.js](http://momentjs.com/).


## Install

```shellsession
npm install convict-format-with-moment
```


## Usage

An example `config.js` file:

```javascript
const convict = require('convict');
const convict_format_with_moment = require('convict-format-with-moment');

// Add all formats
convict.addFormats(convict_format_with_moment);

// Or add only specific formats:
// convict.addFormat(convict_format_with_moment.duration);
// etc.

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

Use Moment.js to validate:

* `duration` - milliseconds or a human readable string (e.g. 3000, "5 days")
* `timestamp` - Unix timestamps or date strings recognized by Moment.js


### Coercion

Convict will automatically coerce environmental variables from strings to their proper types when importing them. For instance, values with the format `int`, `nat`, `port`, or `Number` will become numbers after a straight forward `parseInt` or `parseFloat`. `duration` and `timestamp` are also parse and converted into numbers, though they utilize Moment.js for date parsing.
