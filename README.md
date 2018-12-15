# Node-convict

[![NPM version](http://img.shields.io/npm/v/convict.svg)](https://www.npmjs.org/package/convict)
[![Dependency Status](https://david-dm.org/mozilla/node-convict.svg)](https://david-dm.org/mozilla/node-convict)
[![devDependency Status](https://david-dm.org/mozilla/node-convict/dev-status.svg)](https://david-dm.org/mozilla/node-convict#info=devDependencies)
[![Build Status](https://travis-ci.org/mozilla/node-convict.svg?branch=master)](https://travis-ci.org/mozilla/node-convict)
[![Coverage Status](https://coveralls.io/repos/github/mozilla/node-convict/badge.svg?branch=master)](https://coveralls.io/github/mozilla/node-convict?branch=master)

Convict expands on the standard pattern of configuring node.js applications in a way that is more robust and accessible to collaborators, who may have less interest in digging through imperative code in order to inspect or modify settings. By introducing a configuration schema, convict gives project collaborators more **context** on each setting and enables **validation and early failures** for when configuration goes wrong.


## Features

* **Loading and merging**: configurations are loaded from disk or inline and
    merged
* **Nested structure**: keys and values can be organized in a tree structure
* **Environmental variables**: values can be derived from environmental
    variables
* **Command-line arguments**: values can also be derived from command-line
    arguments
* **Validation**: configurations are validated against your schema (presence
    checking, type checking, custom checking), generating an error report with
    all errors that are found
* **Comments allowed**: schema and configuration files can be either in the
    JSON format or in the newer [JSON5](https://www.npmjs.com/package/json5)
    format, so comments are welcome
* **Configuration file additional types support**: custom file type support can
    be used for the configuration file


## Install

```shell
npm install convict
```

## Usage

An example `config.js` file:

```javascript
var convict = require('convict');

// Define a schema
var config = convict({
  env: {
    doc: "The application environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  ip: {
    doc: "The IP address to bind.",
    format: "ipaddress",
    default: "127.0.0.1",
    env: "IP_ADDRESS",
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 8080,
    env: "PORT",
    arg: "port"
  },
  db: {
    host: {
      doc: "Database host name/IP",
      format: '*',
      default: 'server1.dev.test'
    },
    name: {
      doc: "Database name",
      format: String,
      default: 'users'
    }
  }
});

// Load environment dependent configuration
var env = config.get('env');
config.loadFile('./config/' + env + '.json');

// Perform validation
config.validate({allowed: 'strict'});

module.exports = config;
```

An example `server.js` file leveraging the `config.js` file above:

```javascript
var http = require('http');
var config = require('./config.js');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});

// Consume
server.listen(config.get('port'), config.get('ip'), function(x) {
  var addy = server.address();
  console.log('running on http://' + addy.address + ":" + addy.port);
});
```

To launch your example server, and set a port:

```shell
node ./server.js --port 8080
```

*Note*: arguments *must* be supplied with the double-hyphen `--arg`. (Single hypen's are not supported at this time)


## The Schema

A configuration module, with its deep nested schema, could look like this:

config.js:
```javascript
var config = convict({
  db: {
    name: {
      format: String,
      default: ''
    },
    synchro: {
      active: {
        format: 'Boolean',
        default: false
      },
      remote_url: {
        format: 'url',
        default: 'http://localhost:8080/'
      }
    }
  },
  secret: {
    doc: 'Secret used for session cookies and CSRF tokens',
    format: '*',
    default: '',
    sensitive: true
  }
});

config.loadFile(['./prod.json', './config.json']);
```

Each setting in the schema has the following possible properties, each aiding in
convict's goal of being more robust and collaborator friendly.

* **Type information**: the `format` property specifies either a built-in convict format (`ipaddress`, `port`, `int`, etc.), or it can be a function to check a custom format. During validation, if a format check fails it will be added to the error report.
* **Default values**:  Every setting *must* have a default value.
* **Environmental variables**: If the variable specified by `env` has a value, it will overwrite the setting's default value. An environment variable may not be mapped to more than one setting.
* **Command-line arguments**: If the command-line argument specified by `arg` is supplied, it will overwrite the setting's default value or the value derived from `env`.
* **Documentation**: The `doc` property is pretty self-explanatory. The nice part about having it in the schema rather than as a comment is that we can call `config.getSchemaString()` and have it displayed in the output.
* **Sensitive values and secrets**: If `sensitive` is set to `true`, this value will be masked to `"[Sensitive]"` when `config.toString()` is called. This helps avoid disclosing secret keys when printing configuration at application start for debugging purposes.


### Validation

In order to help detect misconfigurations, convict allows you to define a format for each setting. By default, convict checks if the value of the property has the same type (according to `Object.prototype.toString.call`) as the default value specified in the schema. You can define a custom format checking function in the schema by setting the `format` property.

convict provides several predefined formats for validation that you can use ([using node-validator](https://github.com/chriso/node-validator#list-of-validation-methods) and [moment.js](http://momentjs.com/)). Most of them are self-explanatory:

* `*` - any value is valid
* `int`
* `port`
* `windows_named_pipe`
* `port_or_windows_named_pipe`
* `url`
* `email`
* `ipaddress` - IPv4 and IPv6 addresses
* `duration` - milliseconds or a human readable string (e.g. 3000, "5 days")
* `timestamp` - Unix timestamps or date strings recognized by [moment.js](http://momentjs.com/)
* `nat` - positive integer (natural number)

If `format` is set to one of the built-in JavaScript constructors, `Object`, `Array`, `String`, `Number`, `RegExp`, or `Boolean`, validation will use Object.prototype.toString.call to check that the setting is the proper type.

#### Custom format checking

You can specify a custom format checking method on a property basis.

For example:

```javascript
var config = convict({
  key: {
    doc: "API key",
    format: function check (val) {
      if (!/^[a-fA-F0-9]{64}$/.test(val)) {
        throw new Error('must be a 64 character hex key')
      }
    },
    default: '3cec609c9bc601c047af917a544645c50caf8cd606806b4e0a23312441014deb'
  },
  name: {
    doc: "user name",
    format: function check (val) {
      if (typeof val.first_name !== 'string') {
        throw new TypeError(`first name '${val.first_name}' is not a string`);
      }
      if (typeof val.last_name !== 'string') {
        throw new TypeError(`last name '${val.last_name}' is not a string`);
      }
    },
    default: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
});
```

Or, you can use `convict.addFormat()` to register a custom format checking
method that can be reused for many different properties:

```javascript
convict.addFormat({
  name: 'float-percent',
  validate: function(val) {
    if (val !== 0 && (!val || val > 1 || val < 0)) {
      throw new Error('must be a float between 0 and 1, inclusive');
    }
  },
  coerce: function(val) {
    return parseFloat(val, 10);
  }
});

var config = convict({
  space_used: {
    format: 'float-percent',
    default: 0.5
  },
  success_rate: {
    format: 'float-percent',
    default: 60.0
  }
});
```

The `coerce` function is optional.

### Coercion

Convict will automatically coerce environmental variables from strings to their proper types when importing them. For instance, values with the format `int`, `nat`, `port`, or `Number` will become numbers after a straight forward `parseInt` or `parseFloat`. `duration` and `timestamp` are also parse and converted into numbers, though they utilize [moment.js](http://momentjs.com/) for date parsing.


### Precendence order

When merging configuration values from different sources, Convict follows precedence rules. The order, from lowest to highest, is:

1. Default value
2. File (`config.loadFile()`)
3. Environment variables (only used when `env` property is set in schema; can be overridden using the `env` option of the convict function)
4. Command line arguments (only used when `arg` property is set in schema; can be overridden using the `args` option of the convict function)
5. Set and load calls (`config.set()` and `config.load()`)

### Configuration file additional types support

Convict is able to parse files with custom file types during `loadFile`.
For this specify the corresponding parsers with the associated file extensions.

```javascript
convict.addParser({ extension: 'toml', parse: toml.parse });
convict.addParser({ extension: ['yml', 'yaml'], parse: yaml.safeLoad });
convict.addParser([
  { extension: 'json', parse: JSON.parse },
  { extension: 'json5', parse: json5.parse },
  { extension: ['yml', 'yaml'], parse: yaml.safeLoad },
  { extension: 'toml', parse: toml.parse }
]);

const config = convict({ ... });
config.loadFile('config.toml');
```

If no supported extension is detected, `loadFile` will fallback to using the
default json5 parser for backward compatibility.

## API

### var config = convict(schema)

`convict()` takes a schema object or a path to a schema JSON file and returns a
convict configuration object.
JSON files are loaded using `JSON5`, so they can contain comments.

The configuration object has an API for getting and setting values, described
below.

```javascript
var config = convict({
  env: {
    doc: "The applicaton environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  log_file_path: {
    "doc": "Log file path",
    "format": String,
    "default": "/tmp/app.log"
  }
});

// or
config = convict('/some/path/to/a/config-schema.json');
```

### convict.addParser(parser or parserArray)

Adds new parsers for custom file extensions

### convict.addFormat(format) or convict.addFormat(name, validate, coerce)

Adds a new custom format, `format` being an object, see example below.

```javascript
convict.addFormat({
  name: 'float-percent',
  validate: function(val) {
    if (val !== 0 && (!val || val > 1 || val < 0)) {
      throw new Error('must be a float between 0 and 1, inclusive');
    }
  },
  coerce: function(val) {
    return parseFloat(val, 10);
  }
});
```

### convict.addFormats(formats)

Adds new custom formats, `formats` being an object whose keys are the new custom
format names, see example below.

```javascript
convict.addFormats({
  prime: {
    validate: function(val) {
      function isPrime(n) {
        if (n <= 1) return false; // zero and one are not prime
        for (let i=2; i*i <= n; i++) {
          if (n % i === 0) return false;
        }
        return true;
      }
      if (!isPrime(val)) throw new Error('must be a prime number');
    },
    coerce: function(val) {
      return parseInt(val, 10);
    }
  },
  'hex-string': {
    validate: function(val) {
      if (/^[0-9a-fA-F]+$/.test(val)) {
        throw new Error('must be a hexidecimal string');
      }
    }
  }
});
```

### config.get(name)

Returns the current value of the `name` property. `name` can use dot notation to reference nested values. E.g.:
```javascript
config.get('db.host');

// or
config.get('db').host;
```

### config.default(name)

Returns the default value of the `name` property. `name` can use dot notation to reference nested values. E.g.:
```javascript
config.default('server.port');
```

### config.reset(name)

Resets a property to its default value as defined in the schema. E.g.:
```javascript
config.reset('server.port');
```

### config.has(name)

Returns `true` if the property `name` is defined, or `false` otherwise. E.g.:
```javascript
if (config.has('some.property')) {
  // Do something
}
```

### config.set(name, value)

Sets the value of `name` to value. `name` can use dot notation to reference
nested values, e.g. `"db.port"`. If objects in the chain don't yet exist,
they will be initialized to empty objects.
E.g.:
```javascript
config.set('property.that.may.not.exist.yet', 'some value');
config.get('property.that.may.not.exist.yet');
// Returns "some value"
```

### config.load(object)

Loads and merges a JavaScript object into `config`. E.g.:
```javascript
config.load({
  "env": "test",
  "ip": "127.0.0.1",
  "port": 80
});
```
### config.loadFile(file or fileArray)

Loads and merges one or multiple JSON configuration files into `config`.
JSON files are loaded using `JSON5`, so they can contain comments.
E.g.:
```javascript
config.loadFile('./config/' + conf.get('env') + '.json');
```

Or, loading multiple files at once:
```javascript
// CONFIG_FILES=/path/to/production.json,/path/to/secrets.json,/path/to/sitespecific.json
config.loadFile(process.env.CONFIG_FILES.split(','));
```
### config.validate([options])

Validates `config` against the schema used to initialize it. All errors are
collected and thrown or displayed at once.

#### allowed option

1. `warn`: If set to `warn` (that is `{allowed: 'warn'}` is passed), any
   properties specified in config files that are not declared in the schema will
   print a warning. This is the default behavior.

2. `strict`: If set to `strict` (that is `{allowed: 'strict'}` is passed), any
   properties specified in config files that are not declared in the schema will
   throw errors. This is to ensure that the schema and the config files are in
   sync.

### config.getProperties()

Exports all the properties (that is the keys and their current values) as JSON.

### config.toString()

Exports all the properties (that is the keys and their current values) as a JSON
string, with sensitive values masked. Sensitive values are masked even if they
aren't set, to avoid revealing any information.

### config.getSchema()

Exports the schema as JSON.

### config.getSchemaString()

Exports the schema as a JSON string.

### config.getArgs()

The array of process arguments (not including the launcher and application file arguments). Defaults to process.argv unless an override is specified using the args key of the second (options) argument of the convict function.

### config.getEnv()

The map of environment variables. Defaults to process.env unless an override is specified using the env key of the second argument (options) argument of the convict function.

## FAQ

### [How can I define a configuration property as "required" without providing a default value?](https://github.com/mozilla/node-convict/issues/29)

The philosophy was to have production values be the default values. Usually you only want to change defaults for deploy or instance (in aws speak) specific tweaks. However, you can set a default value to `null` and if your format doesn't accept `null` it will throw an error.

### [How can I use convict in a (browserify-based) browser context?](https://github.com/mozilla/node-convict/issues/47)

Thanks to [browserify](http://browserify.org/), `convict` can be used for web applications too. To do so,

* Use [`brfs`](https://www.npmjs.com/package/brfs) to ensure the `fs.loadFileSync` schema-loading calls are inlined at build time rather than resolved at runtime (in Gulp, add `.transform(brfs)` to your browserify pipe).
* To support *"loading configuration from a `http://foo.bar/some.json` URL"*, build a thin wrapper around convict using your favorite http package (e.g. [`superagent`](https://visionmedia.github.io/superagent/)). Typically, in the success callback, call convict's `load()` on the body of the response.


## Contributing

Read the [Contributing](./CONTRIBUTING.md) doc.
