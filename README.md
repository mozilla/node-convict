# Node-convict
[![NPM version](http://img.shields.io/npm/v/convict.svg)](https://www.npmjs.org/package/convict)
[![Build status][travis_img_url]][travis_page_url] [![Dependency Status](https://david-dm.org/mozilla/node-convict.svg)](https://david-dm.org/mozilla/node-convict) [![devDependency Status](https://david-dm.org/mozilla/node-convict/dev-status.svg)](https://david-dm.org/mozilla/node-convict#info=devDependencies) [![Coverage Status](https://img.shields.io/coveralls/mozilla/node-convict.svg)](https://coveralls.io/r/mozilla/node-convict)

[travis_img_url]: https://api.travis-ci.org/mozilla/node-convict.svg
[travis_page_url]: https://travis-ci.org/mozilla/node-convict

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
* **Comments allowed**: JSON files are loaded with the `cjson` module, so
    comments are welcome


## Install
```bash
npm install convict
```

## Example:

An example `config.js`:
```javascript
var convict = require('convict');

// Define a schema
var conf = convict({
  env: {
    doc: "The applicaton environment.",
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
    default: 0,
    env: "PORT"
  }
});

// Load environment dependent configuration
var env = conf.get('env');
conf.loadFile('./config/' + env + '.json');

// Perform validation
conf.validate({strict: true});

module.exports = conf;
```

### Usage
```javascript
var http = require('http');
var conf = require('./config.js');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});

// Consume
server.listen(conf.get('port'), conf.get('ip'), function(x) {
  var addy = server.address();
  console.log('running on http://' + addy.address + ":" + addy.port);
});
```

## The Schema

A configuration module could look like this:

config.js:
```javascript
var config = module.exports = convict({
  env: {
    doc: "The application environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV",
    arg: "node-env",
  }
});

config.loadFile(['./prod.json', './config.json']);
```

Each setting in the schema has four possible properties, each aiding in convict's goal of being more robust and collaborator friendly.

* **Type information**: the `format` property specifies either a built-in convict format (`ipaddress`, `port`, `int`, etc.), or it can be a function to check a custom format. During validation, if a format check fails it will be added to the error report.
* **Default values**:  Every setting *must* have a default value.
* **Environmental variables**: If the variable specified by `env` has a value, it will overwrite the setting's default value.
* **Command-line arguments**: If the command-line argument specified by `arg` is supplied, it will overwrite the setting's default value or the value derived from `env`.
* **Documentation**: The `doc` property is pretty self-explanatory. The nice part about having it in the schema rather than as a comment is that we can call `conf.toSchemaString()` and have it displayed in the output.

Nested configuration settings are also supported:

```javascript
var config = convict({
  server: {
    ip: {
      doc: "IP address to bind",
      format: 'ipaddress',
      default: '0.0.0.0'
    },
    port: {
      doc: "port to bind",
      format: 'port',
      default: 8080
    }
  },
  database: {
    host: {
      doc: "Database host name/IP",
      format: String,
      default: 'testing'
    },
    name: {
      doc: "Database name",
      format: String,
      default: 'users'
    }
  }
});
```

Note: Search for the word "nested" throughout this documentation to find out
more about nested configuration settings.

### Validation
In order to help detect misconfigurations, convict allows you to define a format for each setting. By default, convict checks if the value of the property has the same type (according to `Object.prototype.toString.call`) as the default value specified in the schema. You can define a custom format checking function in the schema by setting the `format` property.

convict provides several predefined formats for validation that you can use ([using node-validator](https://github.com/chriso/node-validator#list-of-validation-methods) and [moment.js](http://momentjs.com/)). Most of them are self-explanatory:

* `*` - any value is valid
* `int`
* `port`
* `url`
* `email`
* `ipaddress` - IPv4 and IPv6 addresses
* `duration` - milliseconds or a human readable string (e.g. 3000, "5 days")
* `timestamp` - Unix timestamps or date strings recognized by [moment.js](http://momentjs.com/)
* `nat` - positive integer (natural number)

If `format` is set to one of the built-in JavaScript constructors, `Object`, `Array`, `String`, `Number`, or `Boolean`, validation will use Object.prototype.toString.call to check that the setting is the proper type.

#### Custom format checking

You can specify a custom format checking method on a property basis.

For example:

```javascript
var conf = convict({
  key: {
    doc: "API key",
    format: function check (val) {
      if (!/^[a-fA-F0-9]{64}$/.test(val)) {
        throw new Error('must be a 64 character hex key')
      }
    },
    default: '3cec609c9bc601c047af917a544645c50caf8cd606806b4e0a23312441014deb'
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

var conf = convict({
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

The second argument to `coerce` is the `config` object, this can be used to implement placeholders and other advanced functionality:

```javascript
convict.addFormat({
  name: "placeholder",
  validate: function(val) {
    /* validate proper path here */
  },
  coerce: function(val, config) {
    return val.replace(/\$\{([\w\.]+)}/g, function(v,m) { return config.get(m); });
  }
});

var conf = convict({
  env: {
    format: ['production', 'development'],
    default: 'development',
    env: 'NODE_ENV',
    doc: 'The environment that we\'re running in.'
  },
  configPath: {
    format: 'placeholder',
    default: '/path/to/config',
    doc: 'Path to configuration files.'
  },
  config: {
    format: 'placeholder',
    default: '${configPath}/${env}.json',
    doc: 'Path to configuration file.'
  }
});

conf.get('config'); /* "/path/to/config/development.json" */
```

### Precendence order

When merging configuration values from different sources, Convict follows precedence rules. The order, from lowest to highest, is:

1. Default value
2. File (`config.loadFile()`)
3. Environment variables
4. Command line arguments
5. Set and load calls (`config.set()` and `config.load()`)

## API

### var config = convict(schema)
`convict()` takes a schema object and returns a convict configuration object. The configuration object has an API for getting and setting values, described below.

### config.get(name)
Returns the current value of the `name` property. `name` can use dot notation to reference nested values. E.g.:
```javascript
config.get('database.host');

// or
config.get('database').host;
```

### config.default(name)
Returns the default value of the `name` property. `name` can use dot notation to reference nested values. E.g.:
```javascript
config.default('server.port');
```

### config.has(name)
Returns `true` if the property `name` is defined, or `false` otherwise. E.g.:
```javascript
if (config.has('some.property')) {
  // Do something
}
```

### config.set(name, value)
Sets the value of `name` to value. `name` can use dot notation to reference nested values, e.g. `"database.port"`. If objects in the chain don't yet exist, they will be initialized to empty objects. E.g.:
```javascript
config.set('property.that.may.not.exist.yet', 'some value');
config.get('property.that.may.not.exist.yet');
// Returns "some value"
```

### config.load(object)
This will load and merge a JavaScript object into `config`. E.g.:
```javascript
config.load({
  "env": "test",
  "ip": "127.0.0.1",
  "port": 80
});
```

### config.loadFile(file or [file1, file2, ...])
This will load and merge one or multiple JSON configuration files into `config`. JSON files are loaded using `cjson`, so they can contain comments. E.g.:
```javascript
conf.loadFile('./config/' + conf.get('env') + '.json');
```

Or, loading multiple files at once:
```javascript
// CONFIG_FILES=/path/to/production.json,/path/to/secrets.json,/path/to/sitespecific.json
conf.loadFile(process.env.CONFIG_FILES.split(','));
```

### config.validate([options])

Validates `config` against the schema used to initialize it. All errors are
collected and thrown at once.

Options: At the moment `strict` is the only available option.

If the `strict` option is passed (that is `{strict: true}` is passed), any
properties specified in config files that are not declared in the schema will
result in errors. This is to ensure that the schema and the config files are in
sync. By default the strict mode is set to false.

### config.getProperties()

Exports all the properties (that is the keys and their current values) as JSON.

### config.toString()

Exports all the properties (that is the keys and their current values) as a
JSON string.

### config.getSchema()

Exports the schema as JSON.

### config.getSchemaString()

Exports the schema as a JSON string.


## FAQ

### [How can I define a configuration property as "required" without providing a default value?](https://github.com/mozilla/node-convict/issues/29)

The philosophy was to have production values be the default values. Usually you only want to change defaults for deploy or instance (in aws speak) specific tweaks. However, you can set a default value to `null` and if your format doesn't accept `null` it will throw an error.

### [How can I use convict in a (browserify-based) browser context?](https://github.com/mozilla/node-convict/issues/47)

Thanks to [browserify](http://browserify.org/), `convict` can be used for web applications too. To do so,

* Use [`brfs`](https://www.npmjs.com/package/brfs) to ensure the `fs.loadFileSync` schema-loading calls are inlined at build time rather than resolved at runtime (in Gulp, add `.transform(brfs)` to your browserify pipe).
* To support *"loading configuration from a `http://foo.bar/some.json` URL"*, build a thin wrapper around convict using your favorite http package (e.g. [`superagent`](https://visionmedia.github.io/superagent/)). Typically, in the success callback, call convict's `load()` on the body of the response.
