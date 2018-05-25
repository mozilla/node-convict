/**
 * node-convict
 * Configuration management with support for environmental variables, files,
 * and validation.
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var json5 = require('json5');
var fs = require('fs');
var validator = require('validator');
var moment = require('moment');
var cloneDeep = require('lodash.clonedeep');
var deprecate = require('depd')('node-convict');

function assert(assertion, err_msg) {
  if (!assertion) {
    throw new Error(err_msg);
  }
}

// format can be a:
// - predefine type, as seen below
// - an array of enumerated values, e.g. ["production", "development", "testing"]
// - built-in JavaScript type, i.e. Object, Array, String, Number, Boolean, RegExp
// - or if omitted, the Object.prototype.toString.call of the default value

/**
 * Checks if x is a valid port
 *
 * @param {*} x
 * @returns {Boolean}
 */
function isPort(x) {
  return Number.isInteger(x) && x >= 0 && x <= 65535;
}

/**
 * Checks if x is a windows named pipe
 *
 * @see https://msdn.microsoft.com/en-us/library/windows/desktop/aa365783(v=vs.85).aspx
 * @param {*} x
 * @returns {Boolean}
 */
function isWindowsNamedPipe(x) {
  return String(x).includes('\\\\.\\pipe\\');
}

var types = {
  '*': function _() {},
  int: function int(x) {
    assert(Number.isInteger(x), 'must be an integer');
  },
  nat: function nat(x) {
    assert(Number.isInteger(x) && x >= 0, 'must be a positive integer');
  },
  port: function port(x) {
    assert(isPort(x), 'ports must be within range 0 - 65535');
  },
  windows_named_pipe: function windows_named_pipe(x) {
    assert(isWindowsNamedPipe(x), 'must be a valid pipe');
  },
  port_or_windows_named_pipe: function port_or_windows_named_pipe(x) {
    if (!isWindowsNamedPipe(x)) {
      assert(isPort(x), 'must be a windows named pipe or a number within range 0 - 65535');
    }
  },
  url: function url(x) {
    assert(validator.isURL(x), 'must be a URL');
  },
  email: function email(x) {
    assert(validator.isEmail(x), 'must be an email address');
  },
  ipaddress: function ipaddress(x) {
    assert(validator.isIP(x), 'must be an IP address');
  },
  duration: function duration(x) {
    var err_msg = 'must be a positive integer or human readable string (e.g. 3000, "5 days")';
    if (Number.isInteger(x)) {
      assert(x >= 0, err_msg);
    } else {
      assert(x.match(/^(\d)+ (.+)$/), err_msg);
    }
  },
  timestamp: function timestamp(x) {
    assert(Number.isInteger(x) && x >= 0, 'must be a positive integer');
  }
};
// alias
types.integer = types.int;

var converters = {};

var parsers_registry = {};

var ALLOWED_OPTION_STRICT = 'strict';
var ALLOWED_OPTION_WARN = 'warn';

function flatten(obj, useProperties) {
  var stack = Object.keys(obj);
  var key = void 0;

  var entries = [];

  while (stack.length) {
    key = stack.shift();
    var val = walk(obj, key);
    if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && !Array.isArray(val) && val != null) {
      if (useProperties) {
        if ('properties' in val) {
          val = val.properties;
          key = key + '.properties';
        } else {
          entries.push([key, val]);
          continue;
        }
      }
      var subkeys = Object.keys(val);

      // Don't filter out empty objects
      if (subkeys.length > 0) {
        subkeys.forEach(function (subkey) {
          stack.push(key + '.' + subkey);
        });
        continue;
      }
    }
    entries.push([key, val]);
  }

  var flattened = {};
  entries.forEach(function (entry) {
    var key = entry[0];
    if (useProperties) {
      key = key.replace(/\.properties/g, '');
    }
    var val = entry[1];
    flattened[key] = val;
  });

  return flattened;
}

function _validate(instance, schema, strictValidation) {
  var errors = {
    undeclared: [],
    invalid_type: [],
    missing: []
  };

  var flatInstance = flatten(instance);
  var flatSchema = flatten(schema.properties, true);

  Object.keys(flatSchema).forEach(function (name) {
    var schemaItem = flatSchema[name];
    var instanceItem = flatInstance[name];
    if (!(name in flatInstance)) {
      try {
        if (_typeof(schemaItem.default) === 'object' && !Array.isArray(schemaItem.default)) {
          // Missing item may be an object with undeclared children, so try to
          // pull it unflattened from the config instance for type validation
          instanceItem = walk(instance, name);
        } else {
          throw new Error('missing');
        }
      } catch (e) {
        var err = new Error("configuration param '" + name + "' missing from config, did you override its parent?");
        errors.missing.push(err);
        return;
      }
    }
    delete flatInstance[name];

    // ignore nested keys of schema 'object' properties
    if (schemaItem.format === 'object' || _typeof(schemaItem.default) === 'object') {
      Object.keys(flatInstance).filter(function (key) {
        return key.lastIndexOf(name + '.', 0) === 0;
      }).forEach(function (key) {
        delete flatInstance[key];
      });
    }

    if (!(typeof schemaItem.default === 'undefined' && instanceItem === schemaItem.default)) {
      try {
        schemaItem._format(instanceItem);
      } catch (err) {
        errors.invalid_type.push(err);
      }
    }

    return;
  });

  if (strictValidation) {
    Object.keys(flatInstance).forEach(function (name) {
      var err = new Error("configuration param '" + name + "' not declared in the schema");
      errors.undeclared.push(err);
    });
  }

  return errors;
}

// helper for asserting that a value is in the list of valid options
function contains(options, x) {
  assert(validator.isIn(x, options), 'must be one of the possible values: ' + JSON.stringify(options));
}

var BUILT_INS_BY_NAME = {
  'Object': Object,
  'Array': Array,
  'String': String,
  'Number': Number,
  'Boolean': Boolean,
  'RegExp': RegExp
};
var BUILT_IN_NAMES = Object.keys(BUILT_INS_BY_NAME);
var BUILT_INS = BUILT_IN_NAMES.map(function (name) {
  return BUILT_INS_BY_NAME[name];
});

function normalizeSchema(name, node, props, fullName, env, argv, sensitive) {
  // If the current schema node is not a config property (has no "default"), recursively normalize it.
  if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object' && node !== null && !Array.isArray(node) && Object.keys(node).length > 0 && !('default' in node)) {
    props[name] = {
      properties: {}
    };
    Object.keys(node).forEach(function (k) {
      normalizeSchema(k, node[k], props[name].properties, fullName + '.' + k, env, argv, sensitive);
    });
    return;
  } else if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) !== 'object' || Array.isArray(node) || node === null || Object.keys(node).length == 0) {
    // Normalize shorthand "value" config properties
    node = { default: node };
  }

  var o = cloneDeep(node);
  props[name] = o;
  // associate this property with an environmental variable
  if (o.env) {
    if (!env[o.env]) {
      env[o.env] = [];
    }
    env[o.env].push(fullName);
  }

  // associate this property with a command-line argument
  if (o.arg) {
    if (argv[o.arg]) {
      throw new Error("'" + fullName + "' reuses a command-line argument: " + o.arg);
    }
    argv[o.arg] = fullName;
  }

  // mark this property as sensitive
  if (o.sensitive === true) {
    sensitive.add(fullName);
  }

  // store original format function
  var format = o.format;
  var newFormat = void 0;

  if (BUILT_INS.indexOf(format) >= 0 || BUILT_IN_NAMES.indexOf(format) >= 0) {
    // if the format property is a built-in JavaScript constructor,
    // assert that the value is of that type
    var Format = typeof format === 'string' ? BUILT_INS_BY_NAME[format] : format;
    newFormat = function newFormat(x) {
      assert(Object.prototype.toString.call(x) == Object.prototype.toString.call(new Format()), 'must be of type ' + Format.name);
    };
    o.format = Format.name.toLowerCase();
  } else if (typeof format === 'string') {
    // store declared type
    if (!types[format]) {
      throw new Error("'" + fullName + "' uses an unknown format type: " + format);
    }

    // use a predefined type
    newFormat = types[format];
  } else if (Array.isArray(format)) {
    // assert that the value is a valid option
    newFormat = contains.bind(null, format);
  } else if (typeof format === 'function') {
    newFormat = format;
  } else if (format && typeof format !== 'function') {
    throw new Error("'" + fullName + "': `format` must be a function or a known format type.");
  }

  if (!newFormat && !format) {
    // default format is the typeof the default value
    var type = Object.prototype.toString.call(o.default);
    newFormat = function newFormat(x) {
      assert(Object.prototype.toString.call(x) == type, ' should be of type ' + type.replace(/\[.* |]/g, ''));
    };
  }

  o._format = function (x) {
    try {
      newFormat(x);
    } catch (e) {
      // attach the value and the property's fullName to the error
      e.fullName = fullName;
      e.value = x;
      throw e;
    }
  };
}

function importEnvironment(o) {
  Object.keys(o._env).forEach(function (envStr) {
    if (process.env[envStr] !== undefined) {
      var ks = o._env[envStr];
      ks.forEach(function (k) {
        o.set(k, process.env[envStr]);
      });
    }
  });
}

function addDefaultValues(schema, c, instance) {
  Object.keys(schema.properties).forEach(function (name) {
    var p = schema.properties[name];
    if (p.properties) {
      var kids = c[name] || {};
      addDefaultValues(p, kids, instance);
      c[name] = kids;
    } else {
      c[name] = coerce(name, cloneDeep(p.default), schema, instance);
    }
  });
}

function isObj(o) {
  return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && o !== null;
}

function overlay(from, to, schema) {
  Object.keys(from).forEach(function (k) {
    // leaf
    if (Array.isArray(from[k]) || !isObj(from[k]) || !schema || schema.format === 'object') {
      to[k] = coerce(k, from[k], schema);
    } else {
      if (!isObj(to[k])) to[k] = {};
      overlay(from[k], to[k], schema.properties[k]);
    }
  });
}

function traverseSchema(schema, path) {
  var ar = path.split('.');
  var o = schema;
  while (ar.length > 0) {
    var k = ar.shift();
    if (o && o.properties && o.properties[k]) {
      o = o.properties[k];
    } else {
      o = null;
      break;
    }
  }

  return o;
}

function getFormat(schema, path) {
  var o = traverseSchema(schema, path);
  if (o == null) return null;
  if (typeof o.format === 'string') return o.format;
  if (o.default != null) return _typeof(o.default);
  return null;
}

function coerce(k, v, schema, instance) {
  // magic coerceing
  var format = getFormat(schema, k);

  if (typeof v === 'string') {
    if (converters.hasOwnProperty(format)) {
      return converters[format](v, instance);
    }
    switch (format) {
      case 'port':
      case 'nat':
      case 'integer':
      case 'int':
        v = parseInt(v, 10);break;
      case 'port_or_windows_named_pipe':
        v = isWindowsNamedPipe(v) ? v : parseInt(v, 10);break;
      case 'number':
        v = parseFloat(v);break;
      case 'boolean':
        v = String(v).toLowerCase() !== 'false';break;
      case 'array':
        v = v.split(',');break;
      case 'object':
        v = JSON.parse(v);break;
      case 'regexp':
        v = new RegExp(v);break;
      case 'timestamp':
        v = moment(v).valueOf();break;
      case 'duration':
        {
          var split = v.split(' ');
          if (split.length == 1) {
            // It must be an integer in string form.
            v = parseInt(v, 10);
          } else {
            // Add an "s" as the unit of measurement used in Moment
            if (!split[1].match(/s$/)) split[1] += 's';
            v = moment.duration(parseInt(split[0], 10), split[1]).valueOf();
          }
          break;
        }
      default:
      // TODO: Should we throw an exception here?
    }
  }

  return v;
}

function _loadFile(path) {
  var segments = path.split('.');
  var extension = segments.length > 1 ? segments.pop() : '';
  var parse = parsers_registry[extension] || json5.parse;

  // TODO Get rid of the sync call
  // eslint-disable-next-line no-sync
  return parse(fs.readFileSync(path, 'utf-8'));
}

function walk(obj, path, initializeMissing) {
  if (path) {
    var ar = path.split('.');
    while (ar.length) {
      var k = ar.shift();
      if (initializeMissing && obj[k] == null) {
        obj[k] = {};
        obj = obj[k];
      } else if (k in obj) {
        obj = obj[k];
      } else {
        throw new Error("cannot find configuration param '" + path + "'");
      }
    }
  }

  return obj;
}

/**
 * @returns a config object
 */
var convict = function convict(def) {

  // TODO: Rename this `rv` variable (supposedly "return value") into something
  // more meaningful.
  var rv = {
    /**
     * Exports all the properties (that is the keys and their current values) as JSON
     */
    getProperties: function getProperties() {
      return cloneDeep(this._instance);
    },

    /**
     * Exports all the properties (that is the keys and their current values) as
     * a JSON string, with sensitive values masked. Sensitive values are masked
     * even if they aren't set, to avoid revealing any information.
     */
    toString: function toString() {
      var clone = cloneDeep(this._instance);
      this._sensitive.forEach(function (key) {
        var path = key.split('.');
        var childKey = path.pop();
        var parentKey = path.join('.');
        var parent = walk(clone, parentKey);
        parent[childKey] = '[Sensitive]';
      });
      return JSON.stringify(clone, null, 2);
    },

    /**
     * Exports the schema as JSON.
     */
    getSchema: function getSchema() {
      return JSON.parse(JSON.stringify(this._schema));
    },

    /**
     * Exports the schema as a JSON string
     */
    getSchemaString: function getSchemaString() {
      return JSON.stringify(this._schema, null, 2);
    },

    /**
     * @returns the current value of the name property. name can use dot
     *     notation to reference nested values
     */
    get: function get(path) {
      var o = walk(this._instance, path);
      return cloneDeep(o);
    },

    /**
     * @returns the default value of the name property. name can use dot
     *     notation to reference nested values
     */
    default: function _default(path) {
      // The default value for FOO.BAR.BAZ is stored in `_schema.properties` at:
      //   FOO.properties.BAR.properties.BAZ.default
      path = path.split('.').join('.properties.') + '.default';
      var o = walk(this._schema.properties, path);
      return cloneDeep(o);
    },

    /**
     * Resets a property to its default value as defined in the schema
     */
    reset: function reset(prop_name) {
      this.set(prop_name, this.default(prop_name));
    },

    /**
     * @returns true if the property name is defined, or false otherwise
     */
    has: function has(path) {
      try {
        var r = this.get(path);
        // values that are set but undefined return false
        return typeof r !== 'undefined';
      } catch (e) {
        return false;
      }
    },

    /**
     * Sets the value of name to value. name can use dot notation to reference
     * nested values, e.g. "database.port". If objects in the chain don't yet
     * exist, they will be initialized to empty objects
     */
    set: function set(k, v) {
      v = coerce(k, v, this._schema, this);
      var path = k.split('.');
      var childKey = path.pop();
      var parentKey = path.join('.');
      var parent = walk(this._instance, parentKey, true);
      parent[childKey] = v;
      return this;
    },

    /**
     * Loads and merges a JavaScript object into config
     */
    load: function load(conf) {
      overlay(conf, this._instance, this._schema);
      // environment and arguments always overrides config files
      importEnvironment(rv);
      return this;
    },

    /**
     * Loads and merges one or multiple JSON configuration files into config
     */
    loadFile: function loadFile(paths) {
      var self = this;
      if (!Array.isArray(paths)) paths = [paths];
      paths.forEach(function (path) {
        overlay(_loadFile(path), self._instance, self._schema);
      });
      // environment and arguments always overrides config files
      importEnvironment(rv);
      return this;
    },

    /**
     * Validates config against the schema used to initialize it
     */
    validate: function validate(options) {
      options = options || {};

      if ('strict' in options) {
        if (options.strict) {
          options.allowed = ALLOWED_OPTION_STRICT;
          deprecate('this syntax is outdated: validate({strict: true}), you must use: validate({allowed: \'' + ALLOWED_OPTION_STRICT + '\'})');
        } else {
          deprecate('this syntax is outdated: validate({strict: false}), you must just use: validate()');
        }
      }

      options.allowed = options.allowed || ALLOWED_OPTION_WARN;
      var errors = _validate(this._instance, this._schema, options.allowed);

      if (errors.invalid_type.length + errors.undeclared.length + errors.missing.length) {
        var sensitive = this._sensitive;

        var fillErrorBuffer = function fillErrorBuffer(errors) {
          var err_buf = '';
          for (var i = 0; i < errors.length; i++) {

            if (err_buf.length) err_buf += '\n';

            var e = errors[i];

            if (e.fullName) {
              err_buf += e.fullName + ': ';
            }
            if (e.message) err_buf += e.message;
            if (e.value && !sensitive.has(e.fullName)) {
              err_buf += ': value was ' + JSON.stringify(e.value);
            }
          }
          return err_buf;
        };

        var types_err_buf = fillErrorBuffer(errors.invalid_type);
        var params_err_buf = fillErrorBuffer(errors.undeclared);
        var missing_err_buf = fillErrorBuffer(errors.missing);

        var output_err_bufs = [types_err_buf, missing_err_buf];

        if (options.allowed === ALLOWED_OPTION_WARN && params_err_buf.length) {
          var warning = 'Warning:';
          if (process.stdout.isTTY) {
            // Write 'Warning:' in bold and in yellow
            var SET_BOLD_YELLOW_TEXT = '\x1b[33;1m';
            var RESET_ALL_ATTRIBUTES = '\x1b[0m';
            warning = SET_BOLD_YELLOW_TEXT + warning + RESET_ALL_ATTRIBUTES;
          }
          global.console.log(warning + ' ' + params_err_buf);
        } else if (options.allowed === ALLOWED_OPTION_STRICT) {
          output_err_bufs.push(params_err_buf);
        }

        var output = output_err_bufs.filter(function (str) {
          return str.length;
        }).join('\n');

        if (output.length) {
          throw new Error(output);
        }
      }
      return this;
    }
  };

  // If the definition is a string treat it as an external schema file
  if (typeof def === 'string') {
    rv._def = _loadFile(def);
  } else {
    rv._def = def;
  }

  // build up current config from definition
  rv._schema = {
    properties: {}
  };

  rv._env = {};
  rv._argv = {};
  rv._sensitive = new Set();

  Object.keys(rv._def).forEach(function (k) {
    normalizeSchema(k, rv._def[k], rv._schema.properties, k, rv._env, rv._argv, rv._sensitive);
  });

  rv._instance = {};
  addDefaultValues(rv._schema, rv._instance, rv);
  importEnvironment(rv);

  return rv;
};

/**
 * Adds a new custom format
 */
convict.addFormat = function (name, validate, coerce) {
  if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
    validate = name.validate;
    coerce = name.coerce;
    name = name.name;
  }
  if (typeof validate !== 'function') {
    throw new Error('Validation function for ' + name + ' must be a function.');
  }
  if (coerce && typeof coerce !== 'function') {
    throw new Error('Coerce function for ' + name + ' must be a function.');
  }
  types[name] = validate;
  if (coerce) converters[name] = coerce;
};

/**
 * Adds new custom formats
 */
convict.addFormats = function (formats) {
  Object.keys(formats).forEach(function (type) {
    convict.addFormat(type, formats[type].validate, formats[type].coerce);
  });
};

/**
 * Adds a new custom file parser
 */
convict.addParser = function (parsers) {
  if (!Array.isArray(parsers)) parsers = [parsers];

  parsers.forEach(function (parser) {
    if (!parser) throw new Error('Invalid parser');
    if (!parser.extension) throw new Error('Missing parser.extension');
    if (!parser.parse) throw new Error('Missing parser.parse function');

    if (typeof parser.parse !== 'function') throw new Error('Invalid parser.parse function');

    var extensions = !Array.isArray(parser.extension) ? [parser.extension] : parser.extension;
    extensions.forEach(function (extension) {
      if (typeof extension !== 'string') throw new Error('Invalid parser.extension');
      parsers_registry[extension] = parser.parse;
    });
  });
};

module.exports = convict;