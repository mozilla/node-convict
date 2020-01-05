/**
 * convict
 * Configuration management with support for environmental variables, files,
 * and validation.
 */
'use strict';

const fs        = require('fs');
const parseArgs = require('yargs-parser');
const cloneDeep = require('lodash.clonedeep');
const cvtError  = require('./convicterror.js');

// 1
const CONVICT_ERROR = cvtError.CONVICT_ERROR;
const PARSING_ERROR = cvtError.PARSING_ERROR;
// 2
const SCHEMA_INVALID = cvtError.SCHEMA_INVALID;
const CUSTOMISE_FAILED = cvtError.CUSTOMISE_FAILED;
const INCORRECT_USAGE = cvtError.INCORRECT_USAGE;
const PATH_INVALID = cvtError.PATH_INVALID;
// 3
const VALUE_INVALID = cvtError.VALUE_INVALID;
const FORMAT_INVALID = cvtError.FORMAT_INVALID;


//>>>> format can be a:

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

function assert(assertion, err_msg) {
  if (!assertion) {
    throw new Error(err_msg);
    //        ^^^^^-- will be catch in _cvtFormat and convert to FORMAT_INVALID Error.
  }
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
  }
};
// alias
types.integer = types.int;

//<<<< endformat

const converters = new Map();

const getters = {
  order: [ 'value', 'force' ],
  list: {}
}

const parsers_registry = { '*': JSON.parse };

const ALLOWED_OPTION_STRICT = 'strict';
const ALLOWED_OPTION_WARN = 'warn';

function flatten(obj, useProperties) {
  const stack = Object.keys(obj);
  const entries = [];

  while (stack.length) {
    let key = stack.shift();
    let val = walk(obj, key);
    if (typeof val === 'object' && !Array.isArray(val) && val != null) {
      if (useProperties) {
        if ('_cvtProperties' in val) {
          val = val._cvtProperties;
          key = key + '._cvtProperties';
        } else {
          entries.push([key, val]);
          continue;
        }
      }
      const subkeys = Object.keys(val);

      // Don't filter out empty objects
      if (subkeys.length > 0) {
        subkeys.forEach(function(subkey) {
          stack.push(key + '.' + subkey);
        });
        continue;
      }
    }
    entries.push([key, val]);
  }

  const flattened = {};
  entries.forEach(function(entry) {
    let key = entry[0];
    if (useProperties) {
      key = key.replace(/\._cvtProperties/g, '');
    }
    const val = entry[1];
    flattened[key] = val;
  });

  return flattened;
}

function validate(instance, schema, strictValidation) {
  const errors = {
    undeclared: [],
    invalid_type: [],
    missing: []
  };

  const flatInstance = flatten(instance);
  const flatSchema = flatten(schema._cvtProperties, true);

  Object.keys(flatSchema).forEach(function(name) {
    const schemaItem = flatSchema[name];
    let instanceItem = flatInstance[name];
    if (!(name in flatInstance)) {
      try {
        if (typeof schemaItem.default === 'object' &&
          !Array.isArray(schemaItem.default)) {
          // Missing item may be an object with undeclared children, so try to
          // pull it unflattened from the config instance for type validation
          instanceItem = walk(instance, name);
        } else {
          throw new PARSING_ERROR('missing');
        }
      } catch (e) {
        const msg = 'configuration param "' + name + '" missing from config, did you override its parent?';
        const err = new PARSING_ERROR(msg);
        errors.missing.push(err);
        return;
      }
    }
    delete flatInstance[name];

    // ignore nested keys of schema 'object' properties
    if (schemaItem.format === 'object' || typeof schemaItem.default === 'object') {
      Object.keys(flatInstance)
        .filter(function(key) {
          return key.lastIndexOf(name + '.', 0) === 0;
        }).forEach(function(key) {
          delete flatInstance[key];
        });
    }

    if (!(typeof schemaItem.default === 'undefined' &&
          instanceItem === schemaItem.default)) {
      try {
        schemaItem._cvtFormat(instanceItem);
      } catch (err) {
        errors.invalid_type.push(err);
      }
    }

    return;
  });

  if (strictValidation) {
    Object.keys(flatInstance).forEach(function(name) {
      const err = new VALUE_INVALID("configuration param '" + name + "' not declared in the schema");
      errors.undeclared.push(err);
    });
  }

  return errors;
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

function normalizeSchema(name, rawSchema, props, fullName) {
  if (name === '_cvtProperties') {
    throw new Error("'" + fullName + "': '_cvtProperties' is reserved word of convict.");
  }

  // If the current schema rawSchema is not a config property (has no "default"), recursively normalize it.
  if (typeof rawSchema === 'object' && rawSchema !== null && !Array.isArray(rawSchema) &&
        Object.keys(rawSchema).length > 0 && !('default' in rawSchema)) {
    props[name] = {
      _cvtProperties: {}
    };
    Object.keys(rawSchema).forEach((key) => {
      const path = fullName + '.' + key;
      normalizeSchema.call(this, key, rawSchema[key], props[name]._cvtProperties, path);
    });
    return;
  } else if (typeof rawSchema !== 'object' || Array.isArray(rawSchema) ||
    rawSchema === null || Object.keys(rawSchema).length == 0) {
    // Normalize shorthand "value" config properties
    rawSchema = { default: rawSchema };
  }

  const schema = cloneDeep(rawSchema);
  props[name] = schema;

  Object.keys(schema).forEach((getterName) => {
    if (this._getters.list[getterName]) {
      const usedOnlyOnce = this._getters.list[getterName].usedOnlyOnce;
      if (usedOnlyOnce) {
        if (!this._getterAlreadyUsed[getterName]) {
          this._getterAlreadyUsed[getterName] = new Set();
        }

        const value = schema[getterName];
        if (this._getterAlreadyUsed[getterName].has(value)) {
          if (typeof usedOnlyOnce === 'function') {
            return usedOnlyOnce(value, schema, fullName, getterName);
          } else {
            throw new SCHEMA_INVALID(fullName, 'uses a already used value in "' + getterName + '" getter', value);
          }
        }

        this._getterAlreadyUsed[getterName].add(schema[getterName]);
      }
    }
  });

  // mark this property as sensitive
  if (schema.sensitive === true) {
    this._sensitive.add(fullName);
  }

  // store original format function
  let format = schema.format;
  const newFormat = (() => {
    if (BUILT_INS.indexOf(format) >= 0 || BUILT_IN_NAMES.indexOf(format) >= 0) {
      // if the format property is a built-in JavaScript constructor,
      // assert that the value is of that type
      const Format = typeof format === 'string' ? BUILT_INS_BY_NAME[format] : format;
      const formatFormat = Object.prototype.toString.call(new Format());
      const myFormat = Format.name;
      schema.format = format = myFormat.toLowerCase();
      return (value) => {
        if (formatFormat !== Object.prototype.toString.call(value)) {
          throw new Error('must be of type ' + myFormat);
          //        ^^^^^-- will be catch in _cvtFormat and convert to FORMAT_INVALID Error.
        }
      };
    } else if (typeof format === 'string') {
      // store declared type
      if (!types[format]) {
        throw new SCHEMA_INVALID(fullName, 'uses an unknown format type', format);
      }
      // use a predefined type
      return types[format];
    } else if (Array.isArray(format)) {
      // assert that the value is in the whitelist, example: ['a', 'b', 'c'].include(value)
      const contains = (whitelist, value) => {
        if (!whitelist.includes(value)) {
          throw new Error('must be one of the possible values: ' + JSON.stringify(whitelist));
          //        ^^^^^-- will be catch in _cvtFormat and convert to FORMAT_INVALID Error.
        }
      }
      return contains.bind(null, format);
    } else if (typeof format === 'function') {
      return format;
    } else if (format && typeof format !== 'function') {
      const errorMessage = 'uses an invalid format, it must be a format name, a function, an array or a known format type';
      throw new SCHEMA_INVALID(fullName, errorMessage, (format || '').toString() || 'is a ' + typeof format);
    } else { // !format
      // default format is the typeof the default value
      const defaultFormat = Object.prototype.toString.call(schema.default);
      const myFormat = defaultFormat.replace(/\[.* |]/g, '');
      // magic coerceing
      schema.format = format = myFormat.toLowerCase();
      return (value) => {
        if (defaultFormat !== Object.prototype.toString.call(value)) {
          throw new Error('must be of type ' + myFormat);
          //        ^^^^^-- will be catch in _cvtFormat and convert to FORMAT_INVALID Error.
        }
      };
    }
  })();

  schema._cvtCoerce = (() => {
    if (typeof format === 'string') {
      return getCoerceMethod(format);
    } else {
      return (v) => v;
    }
  })();
  
  schema._cvtFormat = function(value) {
    try {
      newFormat(value, schema); // schema = this
    } catch (err) {
      // attach the value and the property's fullName to the error
      const hasOrigin = !!schema._cvtGetOrigin;
      const getter = (hasOrigin) ? schema._cvtGetOrigin() : false;
      const getterValue = (hasOrigin && schema[getter]) ? schema[getter] : '';
      throw new FORMAT_INVALID(fullName, err.message, getter, getterValue, value);
    }
  };
}

function applyGetters(schema, node) {
  const getters = this._getters;

  Object.keys(schema._cvtProperties).forEach((name) => {
    const mySchema = schema._cvtProperties[name];
    if (mySchema._cvtProperties) {
      if (!node[name]) {
        node[name] = {};
      }
      applyGetters.call(this, mySchema, node[name]);
    } else {
      for (let i = getters.order.length - 1; i >= 0; i--) {
        const getterName = getters.order[i]; // getterName
        const getterObj = getters.list[getterName];
        let propagationAsked = false; // #224 accept undefined

        if (!getterObj || !(getterName in mySchema)) {
          continue;
        }
        const getter = getterObj.getter;
        const value = cloneDeep(mySchema[getterName]);
        const stopPropagation = () => propagationAsked = true;

        // call getter
        node[name] = getter.call(this, value, mySchema, stopPropagation);

        if (typeof node[name] !== 'undefined' || propagationAsked) {
          // We use function because function are not saved/exported in schema
          mySchema._cvtGetOrigin = () => getterName;
          break;
        }
      }
    }
  });
}

function isObj(o) { return (typeof o === 'object' && o !== null); }

function applyValues(from, to, schema) {
  const getters = this._getters;

  const indexVal = getters.order.indexOf('value');
  Object.keys(from).forEach((name) => {
    const mySchema = (schema && schema._cvtProperties) ? schema._cvtProperties[name] : null;
    // leaf
    if (Array.isArray(from[name]) || !isObj(from[name]) || !schema || schema.format === 'object') {
      const bool = mySchema && mySchema._cvtGetOrigin;
      const lastG = bool && mySchema._cvtGetOrigin();

      if (lastG && indexVal < getters.order.indexOf(lastG)) {
        return;
      }
      const coerce = (mySchema && mySchema._cvtCoerce) ? mySchema._cvtCoerce : (v) => v;
      to[name] = coerce(from[name]);
      if (lastG) {
        mySchema._cvtGetOrigin = () => 'value';
      }
    } else {
      if (!isObj(to[name])) to[name] = {};
      applyValues.call(this, from[name], to[name], mySchema);
    }
  });
}

function traverseSchema(schema, path) {
  const ar = path.split('.');
  let o = schema;
  while (ar.length > 0) {
    const k = ar.shift();
    if (o && o._cvtProperties && o._cvtProperties[k]) {
      o = o._cvtProperties[k];
    } else {
      o = null;
      break;
    }
  }

  return o;
}

function isStr(value) {
  return (typeof value === 'string');
}

function getCoerceMethod(format) {
  if (converters.has(format)) {
    return converters.get(format);
  }
  switch (format) {
    case 'port':
    case 'nat':
    case 'integer':
    case 'int':
      return (v) => (typeof v !== 'undefined') ? parseInt(v, 10) : v;
    case 'port_or_windows_named_pipe':
      return (v) => (isWindowsNamedPipe(v)) ? v : parseInt(v, 10);
    case 'number':
      return (v) => (isStr(v)) ? parseFloat(v) : v;
    case 'boolean':
      return (v) => (isStr(v)) ? (String(v).toLowerCase() !== 'false') : v;
    case 'array':
      return (v) => (isStr(v)) ? v.split(',') : v;
    case 'object':
      return (v) => (isStr(v)) ? JSON.parse(v) : v;
    case 'regexp':
      return (v) => (isStr(v)) ? new RegExp(v) : v;
    default:
      // for eslint "Expected a default case"
  }

  return (v) => v;
}

function loadFile(path) {
  const segments = path.split('.');
  const extension = segments.length > 1 ? segments.pop() : '';
  const parse = parsers_registry[extension] || parsers_registry['*'];

  // TODO Get rid of the sync call
  // eslint-disable-next-line no-sync
  return parse(fs.readFileSync(path, 'utf-8'));
}

function walk(obj, path, initializeMissing) {
  if (path) {
    const ar = path.split('.');
    while (ar.length) {
      const k = ar.shift();
      if (initializeMissing && obj[k] == null) {
        obj[k] = {};
        obj = obj[k];
      } else if (k in obj) {
        obj = obj[k];
      } else {
        throw new PATH_INVALID('cannot find configuration param: ' + path);
      }
    }
  }

  return obj;
}

/**
 * @returns a config object
 */
const convict = function convict(def, opts) {

  // TODO: Rename this `rv` variable (supposedly "return value") into something
  // more meaningful.   ^^ --> rv != convict (-> rv is local & convict is global)
  const rv = {
    /**
     * Gets the array of process arguments, using the override passed to the
     * convict function or process.argv if no override was passed.
     */
    getArgs: function() {
      return (opts && opts.args) || process.argv.slice(2);
    },

    /**
     * Gets the environment variable map, using the override passed to the
     * convict function or process.env if no override was passed.
     */
    getEnv: function() {
      return (opts && opts.env) || process.env;
    },

    /**
     * Exports all the properties (that is the keys and their current values) as JSON
     */
    getProperties: function() {
      return cloneDeep(this._instance);
    },

    /**
     * Exports all the properties (that is the keys and their current values) as
     * a JSON string, with sensitive values masked. Sensitive values are masked
     * even if they aren't set, to avoid revealing any information.
     */
    toString: function() {
      const clone = cloneDeep(this._instance);
      this._sensitive.forEach(function(key) {
        const path = key.split('.');
        const childKey = path.pop();
        const parentKey = path.join('.');
        const parent = walk(clone, parentKey);
        parent[childKey] = '[Sensitive]';
      });
      return JSON.stringify(clone, null, 2);
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
      const o = walk(this._instance, path);
      return cloneDeep(o);
    },

    /**
     * @returns the current getter name of the value origin. name can use dot
     *     notation to reference nested values
     */
    getOrigin: function(path) {
      path = (path.split('.').join('._cvtProperties.')) + '._cvtGetOrigin';
      const o = walk(this._schema._cvtProperties, path);
      return o ? o() : null;
    },

    /**
     * Gets array with getter name in the current order of priority
     */
    getGettersOrder: function(path) {
      return cloneDeep(this._getters.order);
    },

    /**
     * sorts getters
     */
    sortGetters: function(newOrder) {
      const sortFilter = sortGetters(this._getters.order, newOrder);

      this._getters.order.sort(sortFilter);
    },

    /**
     * Update local getters config with global config
     */
    refreshGetters: function() {
      this._getters = cloneDeep(getters);
      applyGetters.call(this, this._schema, this._instance);
    },

    /**
     * @returns the default value of the name property. name can use dot
     *     notation to reference nested values
     */
    default: function(path) {
      // The default value for FOO.BAR.BAZ is stored in `_schema._cvtProperties` at:
      //   FOO._cvtProperties.BAR._cvtProperties.BAZ.default
      path = (path.split('.').join('._cvtProperties.')) + '.default';
      const o = walk(this._schema._cvtProperties, path);
      return cloneDeep(o);
    },

    /**
     * Resets a property to its default value as defined in the schema
     */
    reset: function(prop_name) {
      this.set(prop_name, this.default(prop_name), 'default', false);
    },

    /**
     * @returns true if the property name is defined, or false otherwise
     */
    has: function(path) {
      try {
        const r = this.get(path);
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
    set: function(fullpath, value, priority, respectPriority) {
      const mySchema = traverseSchema(this._schema, fullpath);

      if (!priority) {
        priority = 'value';
      } else if (typeof priority !== 'string') {
        priority = 'force';
      } else if (!this._getters.list[priority] && !['value', 'force'].includes(priority)) {
        throw new INCORRECT_USAGE('unknown getter: ' + priority);
      } else if (!mySchema) { // no schema and custom priority = impossible
        const errorMsg = 'you cannot set priority because "' + fullpath + '" not declared in the schema';
        throw new INCORRECT_USAGE(errorMsg);
      }

      // coercing
      const coerce = (mySchema && mySchema._cvtCoerce) ? mySchema._cvtCoerce : (v) => v;
      value = coerce(value);
      // walk to the value
      const path = fullpath.split('.');
      const childKey = path.pop();
      const parentKey = path.join('.');
      const parent = walk(this._instance, parentKey, true);

      // respect priority 
      const canIChangeValue = (() => {
        if (!respectPriority) // -> false or not declared -> always change
          return true;

        const gettersOrder = this._getters.order;

        const bool = mySchema && mySchema._cvtGetOrigin;
        const lastG = bool && mySchema._cvtGetOrigin();

        if (lastG && gettersOrder.indexOf(priority) < gettersOrder.indexOf(lastG)) {
          return false;
        }

        return true;
      })();

      // change the value
      if (canIChangeValue) {
        parent[childKey] = value;
        if (mySchema) {
          mySchema._cvtGetOrigin = () => priority;
        } 
      }

      return this;
    },

    /**
     * Loads and merges a JavaScript object into config
     */
    load: function(obj) {
      applyValues.call(this, obj, this._instance, this._schema);
      return this;
    },

    /**
     * Loads and merges one or multiple JSON configuration files into config
     */
    loadFile: function(paths) {
      if (!Array.isArray(paths)) paths = [paths];
      paths.forEach((path) => {
        // Support empty config files #253
        const json = loadFile(path);
        if (json) {
          this.load(json);
        }
      });
      return this;
    },

    /**
     * Validates config against the schema used to initialize it
     */
    validate: function(options) {
      options = options || {};

      options.allowed = options.allowed || ALLOWED_OPTION_WARN;

      if (options.output && typeof options.output !== 'function') {
        throw new CUSTOMISE_FAILED('options.output is optionnal and must be a function.');
      }

      const output_function = options.output || global.console.log;

      const errors = validate(this._instance, this._schema, options.allowed);

      // Write 'Warning:' in bold and in yellow
      const BOLD_YELLOW_TEXT = '\x1b[33;1m';
      const RESET_TEXT = '\x1b[0m';

      if (errors.invalid_type.length + errors.undeclared.length + errors.missing.length) {
        const sensitive = this._sensitive;

        const fillErrorBuffer = function(errors) {
          let err_buf = '';
          errors.forEach(function(err) {
            if (err_buf.length) {
              err_buf += '\n';
            }

            /*if (err.type) {
              err_buf += '[' + err.type + '] ';
            }*/
            if (err.fullName) {
              err_buf += err.fullName + ': ';
            }
            if (err.message) {
              err_buf += err.message;
            }

            const hidden = !!sensitive.has(err.fullName);
            const value = (hidden) ? '[Sensitive]' : JSON.stringify(err.value);
            const getterValue = (hidden) ? '[Sensitive]' : JSON.stringify(err.getterValue);

            if (err.value) {
              err_buf +=  ': value was ' + value;
              if (err.getter) {
                err_buf += ', getter was `' + err.getter;
                err_buf += (err.getter !== 'value') ? '=' + getterValue + '`' : '`';
              }
            }

            if (!(err instanceof CONVICT_ERROR)) {
              let warning = '[/!\\ this is probably convict internal error]';
              if (process.stdout.isTTY) {
                warning = BOLD_YELLOW_TEXT + warning + RESET_TEXT;
              }
              err_buf += ' ' + warning;
            }
          });
          return err_buf;
        };

        const types_err_buf = fillErrorBuffer(errors.invalid_type);
        const params_err_buf = fillErrorBuffer(errors.undeclared);
        const missing_err_buf = fillErrorBuffer(errors.missing);

        const output_err_bufs = [types_err_buf, missing_err_buf];

        if (options.allowed === ALLOWED_OPTION_WARN && params_err_buf.length) {
          let warning = 'Warning:';
          if (process.stdout.isTTY) {
            warning = BOLD_YELLOW_TEXT + warning + RESET_TEXT;
          }
          output_function(warning + ' ' + params_err_buf);
        } else if (options.allowed === ALLOWED_OPTION_STRICT) {
          output_err_bufs.push(params_err_buf);
        }

        const output = output_err_bufs
          .filter(function(str) { return str.length; })
          .join('\n');

        if (output.length) {
          throw new VALUE_INVALID(output);
        }

      }
      return this;
    }
  };

  // If the definition is a string treat it as an external schema file
  if (typeof def === 'string') {
    rv._def = loadFile(def);
  } else {
    rv._def = def;
  }

  // build up current config from definition
  rv._schema = {
    _cvtProperties: {}
  };

  rv._getterAlreadyUsed = {};
  rv._sensitive = new Set();

  // inheritance (own getter)
  rv._getters = cloneDeep(getters);

  Object.keys(rv._def).forEach((key) => {
    normalizeSchema.call(rv, key, rv._def[key], rv._schema._cvtProperties, key);
  });

  // config instance
  rv._instance = {};
  applyGetters.call(rv, rv._schema, rv._instance);

  return rv;
};

/**
 * @returns sorted function which sorts array to newOrder
 */
function sortGetters(currentOrder, newOrder) {
  if (!Array.isArray(newOrder)) {
    throw new INCORRECT_USAGE('Invalid argument: newOrder must be an array.');
  }

  // 'force' must be at the end or not given
  const forceOrder = newOrder.indexOf('force');
  if (forceOrder !== -1 && forceOrder !== newOrder.length - 1) {
    throw new INCORRECT_USAGE('Invalid order: force cannot be sorted.');
  } else if (forceOrder !== newOrder.length - 1) {
    newOrder.push('force');
  }

  // exact number of getter name (not less & not more)
  const checkKey = cloneDeep(currentOrder);
  for (let i = newOrder.length - 1; i >= 0; i--) {
    let index = checkKey.indexOf(newOrder[i]);
    if (index !== -1) {
      checkKey.splice(index, 1);
    } else {
      throw new INCORRECT_USAGE('Invalid order: unknown getter: ' + newOrder[i]);
    }
  }
  if (checkKey.length !== 0) {
    const message = (checkKey.length <= 1) ? 'a getter is ' : 'several getters are ';
    throw new INCORRECT_USAGE('Invalid order: '+ message + 'missed: ' + checkKey.join(', '));
  }

  return (a, b) => newOrder.indexOf(a) - newOrder.indexOf(b);
}

/**
 * Gets array with getter name in the current order of priority
 */
convict.getGettersOrder = function(path) {
  return cloneDeep(getters.order);
};

/**
 * Orders getters
 */
convict.sortGetters = function(newOrder) {
  const sortFilter = sortGetters(getters.order, newOrder);

  getters.order.sort(sortFilter);
};

/**
 * Adds a new custom getter
 */
convict.addGetter = function(property, getter, usedOnlyOnce, rewrite) {
  if (typeof property === 'object') {
    getter = property.getter;
    usedOnlyOnce = property.usedOnlyOnce;
    rewrite = property.rewrite;
    property = property.property;
  }
  if (typeof getter !== 'function') {
    throw new CUSTOMISE_FAILED('Getter function for "' + property + '" must be a function.');
  }
  if (['value', 'force'].includes(property)) {
    throw new CUSTOMISE_FAILED('Getter name use a reservated word: ' + property);
  }
  if (getters.list[property] && !rewrite) {
    const advice = ' Set the 4th argument (rewrite) of `addGetter` at true to skip this error.';
    throw new CUSTOMISE_FAILED('The getter property name "' + property + '" is already registered.' + advice);
  }

  if (typeof usedOnlyOnce !== 'function') {
    usedOnlyOnce = !!usedOnlyOnce;
  }

  if (!getters.list[property]) {
    // add before the last key (= force), force must always be the last key
    getters.order.splice(getters.order.length - 1, 0, property);
  }
  getters.list[property] = {
    usedOnlyOnce: usedOnlyOnce,
    getter: getter
  };
};

convict.addGetter('default', (value, schema, stopPropagation) => schema._cvtCoerce(value));
convict.sortGetters(['default', 'value']); // set default before value
convict.addGetter('env', function(value, schema, stopPropagation) {
  return schema._cvtCoerce(this.getEnv()[value]);
});
convict.addGetter('arg', function(value, schema, stopPropagation) {
  const argv = parseArgs(this.getArgs(), {
    configuration: {
      'dot-notation': false
    }
  });
  return schema._cvtCoerce(argv[value]);
}, true);

/**
 * Adds new custom getters
 */
convict.addGetters = function(getters) {
  Object.keys(getters).forEach(function(property) {
    const child = getters[property];
    convict.addGetter(property, child.getter, child.usedOnlyOnce, child.rewrite);
  });
};


/**
 * Adds a new custom format
 */
convict.addFormat = function(name, validate, coerce, rewrite) {
  if (typeof name === 'object') {
    validate = name.validate;
    coerce = name.coerce;
    rewrite = name.rewrite;
    name = name.name;
  }
  if (typeof validate !== 'function') {
    throw new CUSTOMISE_FAILED('Validation function for "' + name + '" must be a function.');
  }
  if (coerce && typeof coerce !== 'function') {
    throw new CUSTOMISE_FAILED('Coerce function for "' + name + '" must be a function.');
  }

  if (types[name] && !rewrite) {
    const advice = ' Set the 4th argument (rewrite) of `addFormat` at true to skip this error.';
    throw new CUSTOMISE_FAILED('The format name "' + name + '" is already registered.' + advice);
  }

  types[name] = validate;
  if (coerce) converters.set(name, coerce);
};

/**
 * Adds new custom formats
 */
convict.addFormats = function(formats) {
  Object.keys(formats).forEach(function(name) {
    convict.addFormat(name, formats[name].validate, formats[name].coerce, formats[name].rewrite);
  });
};

/**
 * Adds a new custom file parser
 */
convict.addParser = function(parsers) {
  if (!Array.isArray(parsers)) parsers = [parsers];

  parsers.forEach(function(parser) {
    if (!parser) throw new CUSTOMISE_FAILED('Invalid parser');
    if (!parser.extension) throw new CUSTOMISE_FAILED('Missing parser.extension');
    if (!parser.parse) throw new CUSTOMISE_FAILED('Missing parser.parse function');

    if (typeof parser.parse !== 'function') throw new CUSTOMISE_FAILED('Invalid parser.parse function');

    const extensions = !Array.isArray(parser.extension) ? [parser.extension] : parser.extension;
    extensions.forEach(function(extension) {
      if (typeof extension !== 'string') throw new CUSTOMISE_FAILED('Invalid parser.extension');
      parsers_registry[extension] = parser.parse;
    });
  });
};

module.exports = convict;
