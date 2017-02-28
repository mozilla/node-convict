/**
 * node-convict
 * Configuration management with support for environmental variables, files,
 * and validation.
 */
'use strict';

const json5     = require('json5');
const fs        = require('fs');
const validator = require('validator');
const moment    = require('moment');
const minimist  = require('minimist');
const cloneDeep = require('lodash.clonedeep');
const deprecate = require('depd')('node-convict')

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

const types = {
  '*': function() { },
  int: function(x) {
    assert(Number.isInteger(x), 'must be an integer');
  },
  nat: function(x) {
    assert(Number.isInteger(x) && x >= 0, 'must be a positive integer');
  },
  port: function(x) {
    assert(isPort(x), 'ports must be within range 0 - 65535');
  },
  windows_named_pipe: function(x) {
    assert(isWindowsNamedPipe(x), 'must be a valid pipe');
  },
  port_or_windows_named_pipe: function(x) {
    if (!isWindowsNamedPipe(x)) {
      assert(isPort(x), 'must be a windows named pipe or a number within range 0 - 65535');
    }
  },
  url: function(x) {
    assert(validator.isURL(x), 'must be a URL');
  },
  email: function(x) {
    assert(validator.isEmail(x), 'must be an email address');
  },
  ipaddress: function(x) {
    assert(validator.isIP(x), 'must be an IP address');
  },
  duration: function(x) {
    let err_msg = 'must be a positive integer or human readable string (e.g. 3000, "5 days")';
    if (Number.isInteger(x)) {
      assert(x >= 0, err_msg);
    } else {
      assert(x.match(/^(\d)+ (.+)$/), err_msg);
    }
  },
  timestamp: function(x) {
    assert(Number.isInteger(x) && x >= 0, 'must be a positive integer');
  }
};
// alias
types.integer = types.int;

const converters = {};

const ALLOWED_OPTION_STRICT = 'strict';
const ALLOWED_OPTION_WARN = 'warn';

function validate(instance, schema, errors,strictValidation) {
  if(!('params_not_declared' in errors)){
    errors.params_not_declared = [];
  }
  if(!('values_not_good_type' in errors)){
    errors.values_not_good_type = [];
  }
  Object.keys(instance).reduce(function(previousErrors, name) {
    let p = schema.properties[name];
    if (strictValidation && !p){
      previousErrors.params_not_declared.push(new Error("configuration param '"+name+"' not declared in the schema"));
      return previousErrors;
    }
    if (!p)
      return previousErrors;
    if (p.properties) {
      let kids = instance[name] || {};
      validate(kids, p, previousErrors,strictValidation);
    } else if (! (typeof p.default === 'undefined' &&
                  instance[name] === p.default)) {
      try {
        p._format(instance[name]);
      } catch (e) {
        previousErrors.values_not_good_type.push(e);
      }
    }
    return previousErrors;
  }, errors);

  return errors;
}

// helper for asserting that a value is in the list of valid options
function contains(options, x) {
  assert(validator.isIn(x, options), 'must be one of the possible values: ' +
         JSON.stringify(options));
}

const BUILT_INS_BY_NAME = {
  'Object': Object,
  'Array': Array,
  'String': String,
  'Number': Number,
  'Boolean': Boolean,
  'RegExp': RegExp
};
const BUILT_IN_NAMES = Object.keys(BUILT_INS_BY_NAME);
const BUILT_INS = BUILT_IN_NAMES.map(function(name) {
  return BUILT_INS_BY_NAME[name];
});

function normalizeSchema(name, node, props, fullName, env, argv) {
  // If the current schema node is not a config property (has no "default"), recursively normalize it.
  if (typeof node === 'object' && !Array.isArray(node) && !('default' in node)) {
    props[name] = {
      properties: {}
    };
    Object.keys(node).forEach(function(k) {
      normalizeSchema(k, node[k], props[name].properties, fullName + '.' +
                      k, env, argv);
    });
    return;
  } else if (typeof node !== 'object' || Array.isArray(node) || node === null) {
    // Normalize shorthand "value" config properties
    node = { default: node };
  }

  let o;
  if (typeof node === 'object') {
    o = Object.create(node);
    props[name] = o;

    // associate this property with an environmental variable
    if (o.env) {
      if (env[o.env]) {
        throw new Error("'" + fullName + "' reuses an env variable: " + o.env);
      }
      env[o.env] = fullName;
    }

    // associate this property with a command-line argument
    if (o.arg) {
      if (argv[o.arg]) {
        throw new Error("'" + fullName + "' reuses a command-line argument: " +
                        o.arg);
      }
      argv[o.arg] = fullName;
    }

    // store original format function
    let format = o.format;
    let newFormat;

    if (BUILT_INS.indexOf(format) >= 0 || BUILT_IN_NAMES.indexOf(format) >= 0) {
      // if the format property is a built-in JavaScript constructor,
      // assert that the value is of that type
      let Format = typeof format === 'string' ? BUILT_INS_BY_NAME[format] : format;
      newFormat = function(x) {
        assert(Object.prototype.toString.call(x) ==
               Object.prototype.toString.call(new Format()),
               'must be of type ' + Format.name);
      };
      o.format = Format.name.toLowerCase();

    } else if (typeof format === 'string') {
      // store declared type
      if (!types[format]) {
        throw new Error("'" + fullName + "' uses an unknown format type: " +
                        format);
      }

      // use a predefined type
      newFormat = types[format];

    } else if (Array.isArray(format)) {
      // assert that the value is a valid option
      newFormat = contains.bind(null, format);

    } else if (typeof format === 'function') {
      newFormat = format;

    } else if (format && typeof format !== 'function') {
      throw new Error("'" + fullName +
                      "': `format` must be a function or a known format type.");
    }

    if (!newFormat && !format) {
      // default format is the typeof the default value
      let type = Object.prototype.toString.call(o.default);
      newFormat = function(x) {
        assert(Object.prototype.toString.call(x) == type,
              ' should be of type ' + type.replace(/\[.* |]/g, ''));
      };
    }

    o._format = function(x) {
      try {
        newFormat(x);
      } catch (e) {
        // attach the value and the property's fullName to the error
        e.fullName = fullName;
        e.value = x;
        throw e;
      }
    };

  } else {
    throw new Error("'" + fullName +
                    "' doesn't appear to be a valid schema object: " +
                    JSON.stringify(node)) +
                    '. Note: schema objects must have a default value.';
  }
}

function importEnvironment(o) {
  Object.keys(o._env).forEach(function(envStr) {
    let k = o._env[envStr];
    if (process.env[envStr]) {
      o.set(k, process.env[envStr]);
    }
  });
}

function importArguments(o) {
  let argv = minimist(process.argv.slice(2));
  Object.keys(o._argv).forEach(function(argStr) {
    let k = o._argv[argStr];
    if (argv[argStr]) {
      o.set(k, argv[argStr]);
    }
  });
}

function addDefaultValues(schema, c, instance) {
  Object.keys(schema.properties).forEach(function(name) {
    let p = schema.properties[name];
    if (p.properties) {
      let kids = c[name] || {};
      addDefaultValues(p, kids, instance);
      if (Object.keys(kids).length) c[name] = kids;
    } else {
      if (!c[name] && 'default' in p) c[name] = coerce(name, p.default, schema, instance);
    }
  });
}

function isObj(o) { return (typeof o === 'object' && o !== null); }

function overlay(from, to, schema) {
  Object.keys(from).forEach(function(k) {
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
  let ar = path.split('.');
  let o = schema;
  while (ar.length > 0) {
    let k = ar.shift();
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
  let o = traverseSchema(schema, path);
  if (o == null) return null;
  if (typeof o.format === 'string') return o.format;
  if (o.default != null) return typeof o.default;
  return null;
}

function coerce(k, v, schema, instance) {
  // magic coerceing
  let format = getFormat(schema, k);

  if (typeof v === 'string') {
    if (converters.hasOwnProperty(format)) {
      return converters[format](v, instance);
    }
    switch (format) {
    case 'port':
    case 'nat':
    case 'integer':
    case 'int': v = parseInt(v, 10); break;
    case 'port_or_windows_named_pipe': v = isWindowsNamedPipe(v) ? v : parseInt(v, 10); break;
    case 'number': v = parseFloat(v); break;
    case 'boolean': v = ((v === 'false') ? false : true); break;
    case 'array': v = v.split(','); break;
    case 'object': v = JSON.parse(v); break;
    case 'regexp': v = new RegExp(v); break;
    case 'timestamp': v = moment(v).valueOf(); break;
    case 'duration': {
      let split = v.split(' ');
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

function loadJSON(path) {
  // TODO Get rid of the sync call
  // eslint-disable-next-line no-sync
  return json5.parse(fs.readFileSync(path, 'utf-8'));
}

/**
 * @returns a config object
 */
let convict = function convict(def) {
  function walk(obj, path) {
    if (path) {
      let ar = path.split('.');
      while (ar.length) {
        let k = ar.shift();
        if (k in obj) {
          obj = obj[k];
        } else {
          throw new Error("cannot find configuration param '" + path + "'");
        }
      }
    }

    return obj;
  }

  // TODO: Rename this `rv` variable (supposedly "return value") into something
  // more meaningful.
  let rv = {
    /**
     * Exports all the properties (that is the keys and their current values) as JSON
     */
    getProperties: function() {
      return cloneDeep(this._instance);
    },

    /**
     * Exports all the properties (that is the keys and their current values) as
     * a JSON string
     */
    toString: function() {
      return JSON.stringify(this._instance, null, 2);
    },

    /**
     * Exports the schema as JSON.
     */
    getSchema: function() {
      return JSON.parse(JSON.stringify(this._schema));
    },

    /**
     * Exports the schema as a JSON string
     */
    getSchemaString: function() {
      return JSON.stringify(this._schema, null, 2);
    },

    /**
     * @returns the current value of the name property. name can use dot
     *     notation to reference nested values
     */
    get: function(path) {
      let o = walk(this._instance, path);
      return typeof o !== 'undefined' ?
        cloneDeep(o) :
        void 0;
    },

    /**
     * @returns the default value of the name property. name can use dot
     *     notation to reference nested values
     */
    default: function(path) {
      // The default value for FOO.BAR.BAZ is stored in `_schema.properties` at:
      //   FOO.properties.BAR.properties.BAZ.default
      path = (path.split('.').join('.properties.')) + '.default';
      let o = walk(this._schema.properties, path);
      return typeof o !== 'undefined' ?
        cloneDeep(o) :
        void 0;
    },

    /**
     * Resets a property to its default value as defined in the schema
     */
    reset: function(prop_name) {
      this.set(prop_name, this.default(prop_name));
    },

    /**
     * @returns true if the property name is defined, or false otherwise
     */
    has: function(path) {
      try {
        let r = this.get(path);
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
    set: function(k, v) {
      v = coerce(k, v, this._schema, this);

      let ar = k.split('.');
      let o = this._instance;
      while (ar.length > 1) {
        k = ar.shift();
        if (!o[k]) o[k] = {};
        o = o[k];
      }
      o[ar.shift()] = v;
      return this;
    },

    /**
     * Loads and merges a JavaScript object into config
     */
    load: function(conf) {
      overlay(conf, this._instance, this._schema);
      // environment and arguments always overrides config files
      importEnvironment(rv);
      importArguments(rv);
      return this;
    },

    /**
     * Loads and merges one or multiple JSON configuration files into config
     */
    loadFile: function(paths) {
      let self = this;
      if (!Array.isArray(paths)) paths = [paths];
      paths.forEach(function(path) {
        overlay(loadJSON(path), self._instance, self._schema);
      });
      // environment and arguments always overrides config files
      importEnvironment(rv);
      importArguments(rv);
      return this;
    },

    /**
     * Validates config against the schema used to initialize it
     */
    validate: function(options) {
      options = options || {};

      if ('strict' in options) {
        if(options.strict){
          options.allowed = ALLOWED_OPTION_STRICT
          deprecate('this syntax is outdated: validate({strict: true}), you must use: validate({allowed: \'' + ALLOWED_OPTION_STRICT + '\'})')
        }else{
          deprecate('this syntax is outdated: validate({strict: false}), you must just use: validate()')
        }
      }

      options.allowed = options.allowed || ALLOWED_OPTION_WARN;
      let errors = validate(this._instance, this._schema, [], options.allowed);

      if (errors.values_not_good_type.length + errors.params_not_declared.length) {

        let fillErrorBuffer = function(errors) {
          let err_buf = '';
          for (let i = 0; i < errors.length; i++) {

            if (err_buf.length) err_buf += '\n';

            let e = errors[i];

            if (e.fullName) {
              err_buf += e.fullName + ': ';
            }
            if (e.message) err_buf += e.message;
            if (e.value) {
              err_buf +=  ': value was ' + JSON.stringify(e.value);
            }
          }
          return err_buf;
        };

        let types_err_buf = fillErrorBuffer(errors.values_not_good_type);
        let params_err_buf = fillErrorBuffer(errors.params_not_declared);

        if (options.allowed === ALLOWED_OPTION_WARN && params_err_buf.length) {
          global.console.log('Warning: '+  params_err_buf);
        } else if (options.allowed === ALLOWED_OPTION_STRICT) {
          types_err_buf += types_err_buf.length && params_err_buf.length ? '\n' + params_err_buf : params_err_buf;
        }

        if(types_err_buf.length) {
          throw new Error(types_err_buf);
        }

      }
      return this;
    }
  };

  // If the definition is a string,
  // treat it as an external schema file.
  if (typeof def === 'string') {
    rv._def = loadJSON(def);
  } else {
    rv._def = def;
  }

  // build up current config from definition
  rv._schema = {
    properties: {}
  };

  rv._env = {};
  rv._argv = {};

  Object.keys(rv._def).forEach(function(k) {
    normalizeSchema(k, rv._def[k], rv._schema.properties, k, rv._env, rv._argv);
  });

  rv._instance = {};
  addDefaultValues(rv._schema, rv._instance, rv);
  importEnvironment(rv);
  importArguments(rv);

  return rv;
};

/**
 * Adds a new custom format
 */
convict.addFormat = function(name, validate, coerce) {
  if (typeof name === 'object') {
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
convict.addFormats = function(formats) {
  Object.keys(formats).forEach(function(type) {
    convict.addFormat(type, formats[type].validate, formats[type].coerce);
  });
};

module.exports = convict;
