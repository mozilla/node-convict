/*
 * node-convict
 * Configuration management with support for environmental variables, files, and validation.
 *
 */

const cjson     = require('cjson');
const fs        = require('fs');
const validator = require('validator');
const moment    = require('moment');
const optimist  = require('optimist');

var check = validator.check;

// format can be a:
// - predefine type, as seen below
// - an array of enumerated values, e.g. ["production", "development", "testing"]
// - built-in JavaScript type, i.e. Object, Array, String, Number, Boolean
// - or if omitted, the Object.prototype.toString.call of the default value

var types = {
  "*": function() { },
  int: function(x) {
    check(x, 'must be an integer').isInt();
  },
  nat: function(x) {
    check(x, 'must be a positive integer').isInt().min(0);
  },
  port: function(x) {
    check(x, 'Ports must be within range 0 - 65535').isInt().min(0).max(65535);
  },
  url: function(x) {
    check(x, 'must be a URL').isUrl();
  },
  email: function(x) {
    check(x, 'must be an email address').isEmail();
  },
  ipaddress: function(x) {
    check(x, 'must be an IP address').isIP();
  },
  ipv4: function(x) {
    check(x, 'must be an IPv4 address').isIPv4();
  },
  ipv6: function(x) {
    check(x, 'must be an IPv6 address').isIPv6();
  },
  duration: function(x) {
    check(x, 'must be a positive integer').isInt().min(0);
  },
  timestamp: function(x) {
    check(x, 'must be a positive integer').isInt().min(0);
  }
};
// alias
types.integer = types.int;

var converters = {};

function validate (instance, schema, errors) {
  Object.keys(schema.properties).reduce(function(previousErrors, name) {
    var p = schema.properties[name];
    if (p.properties) {
      var kids = instance[name] || {};
      validate(kids, p, previousErrors);
    } else if (! (typeof p.default === 'undefined'
          && instance[name] === p.default)) {
      try {
        p._format(instance[name]);
      } catch (e) {
        previousErrors.push(e);
      }
    }
    return previousErrors;
  }, errors);

  return errors;
}

// helper for checking that a value is in the list of valid options
function contains (options, x) {
  check(x, 'must be one of the possible values: ' + JSON.stringify(options)).isIn(options);
}

var BUILT_INS = [Object, Array, String, Number, Boolean];

function normalizeSchema (name, o, props, fullName, env, argv) {

  if (typeof o === 'object' && !Array.isArray(o) && !('default' in o)) {
    props[name] = {
      properties: {},
    };
    Object.keys(o).forEach(function(k) {
      normalizeSchema(k, o[k], props[name].properties, fullName + "." + k, env, argv);
    });
    return;
  } else if (typeof o !== 'object' || Array.isArray(o) || o === null) {
    o = { default: o };
  }


  if (typeof o === 'object') {
    props[name] = o;

    // associate this property with an environmental variabl
    if (o.env) {
      if (env[o.env]) {
        throw new Error("'" + fullName + "' reuses an env variable: " + o.env);
      }
      env[o.env] = fullName;
    }

    // associate this property with a command-line argument
    if (o.arg) {
      if (argv[o.arg]) {
        throw new Error("'" + fullName + "' reuses a command-line argument: " + o.arg);
      }
      argv[o.arg] = fullName;
    }

    // store original format function
    var format = o.format;
    var newFormat;

    if (BUILT_INS.indexOf(format) >= 0) {
      // if the format property is a built-in JavaScript constructor,
      // check that the value is of that type
      newFormat = function(x) {
        check(Object.prototype.toString.call(x), 'must be of type ' + format.name)
          .equals(Object.prototype.toString.call(new format()));
      };
      o.format = format.name.toLowerCase();

    } else if (typeof format === 'string') {
      // store declared type
      if (!types[format]) {
        throw new Error("'" + fullName + "' uses an unknown format type: " + format);
      }

      // use a predefined type
      newFormat = types[format];

    } else if (Array.isArray(format)) {
      // check that the value is a valid option
      newFormat = contains.bind(null, format);

    } else if (typeof format === 'function') {
      newFormat = format;

    } else if (format && typeof format !== 'function') {
      throw new Error("'" + fullName + "': `format` must be a function or a known format type.");
    }

    if (!newFormat && !format) {
      // default format is the typeof the default value
      var type = Object.prototype.toString.call(o.default);
      newFormat = function(x) {
        check(Object.prototype.toString.call(x),
          ' should be of type ' + type.replace(/\[.* |]/g, '')).equals(type);
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

  } else {
    throw new Error("'" + fullName + "' doesn't appear to be a valid schema object: "
                    + JSON.stringify(o))
                    + '. Note: schema objects must have a default value.';
  }
}

function importEnvironment(o) {
  Object.keys(o._env).forEach(function(envStr) {
    var k = o._env[envStr];
    if (process.env[envStr]) {
      o.set(k, process.env[envStr]);
    }
  });
}

function importArguments(o) {
  var argv = optimist.argv;
  Object.keys(o._argv).forEach(function(argStr) {
    var k = o._argv[argStr];
    if (argv[argStr]) {
      o.set(k, argv[argStr]);
    }
  });
}

function addDefaultValues(schema, c) {
  Object.keys(schema.properties).forEach(function(name) {
    var p = schema.properties[name];
    if (p.properties) {
      var kids = c[name] || {};
      addDefaultValues(p, kids);
      if (Object.keys(kids).length) c[name] = kids;
    } else {
      if (!c[name] && 'default' in p) c[name] = coerce(name, p.default, schema);
    }
  });
}

function isObj(o) { return (typeof o === 'object' && o !== null); }

function overlay(from, to, schema) {
  Object.keys(from).forEach(function(k) {
    // leaf
    if (Array.isArray(from[k]) || !isObj(from[k])) {
      to[k] = coerce(k, from[k], schema);
    } else {
      if (!isObj(to[k])) to[k] = {};
      overlay(from[k], to[k]);
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
  return o ? (typeof o.format === 'string' ? o.format : typeof o.default) : null;
}

function coerce(k, v, schema) {
  // magic coerceing
  var format = getFormat(schema, k);

  if (typeof v === 'string') {
    if (converters.hasOwnProperty(format)) {
      return converters[format](v);
    }
    switch (format) {
    case 'port':
    case 'nat':
    case 'integer':
    case 'int': v = parseInt(v, 10); break;
    case 'number': v = parseFloat(v); break;
    case 'boolean': v = ((v === 'false') ? false : true); break;
    case 'array': v = v.split(','); break;
    case 'object': v = JSON.parse(v); break;
    case 'timestamp': v = moment(v).valueOf(); break;
    case 'duration':
      var split = v.split(' ');
      if (!split[1].match(/s$/)) split[1] += 's';
      v = moment.duration(parseInt(split[0], 10), split[1]).valueOf();
      break;
    }
  }

  return v;
}

var convict = function convict(def) {
  function walk(obj, path) {
    if (path) {
      var ar = path.split('.');
      while (ar.length) {
        var k = ar.shift();
        if (k in obj) {
          obj = obj[k];
        } else {
          throw new Error("cannot find configuration param '" + path + "'");
        }
      }
    }

    return obj;
  }

  var rv = {
    toString: function() {
      return JSON.stringify(this._instance, null, 2);
    },
    toSchemaString: function() {
      return JSON.stringify(this._schema, null, 2);
    },
    root: function() {
      return JSON.parse(JSON.stringify(this._instance));
    },
    get: function(path) {
      var o = walk(this._instance, path);
      return typeof o !== 'undefined' ?
        JSON.parse(JSON.stringify(o)) :
        void 0;
    },
    default: function(path) {
      // The default value for FOO.BAR.BAZ is stored in `_schema.properties` at:
      //   FOO.properties.BAR.properties.BAZ.default
      path = (path.split('.').join('.properties.')) + '.default';
      var o = walk(this._schema.properties, path);
      return typeof o !== 'undefined' ?
        JSON.parse(JSON.stringify(o)) :
        void 0;
    },
    has: function(path) {
      try {
        var r = this.get(path);
        // values that are set but undefined return false
        return typeof r !== 'undefined';
      } catch (e) {
        return false;
      }
    },
    set: function(k, v) {
      v = coerce(k, v, this._schema);

      var ar = k.split('.');
      var o = this._instance;
      while (ar.length > 1) {
        var k = ar.shift();
        if (!o[k]) o[k] = {};
        o = o[k];
      }
      o[ar.shift()] = v;
      return this;
    },
    load: function(conf) {
      overlay(conf, this._instance, this._schema);
      // environment and arguments always overrides config files
      importEnvironment(rv);
      importArguments(rv);
      return this;
    },
    loadFile: function(paths) {
      var self = this;
      if (!Array.isArray(paths)) paths = [paths];
      paths.forEach(function(path) {
        overlay(cjson.load(path), self._instance);
      });
      // environment and arguments always overrides config files
      importEnvironment(rv);
      importArguments(rv);
      return this;
    },
    validate: function() {
      var errors = validate(this._instance, this._schema, []);

      if (errors.length) {
        var errBuf = '';

        for (var i = 0; i < errors.length; i++) {

          if (errBuf.length) errBuf += '\n';

          var e = errors[i];

          if (e.fullName) {
            errBuf += e.fullName + ': ';
          }
          if (e.message) errBuf += e.message;
          if (e.value) {
            errBuf +=  ': value was ' + JSON.stringify(e.value);
          }
        }
        throw new Error(errBuf);
      }
      return this;
    }
  };

  // If the definition is a string,
  // treat it as an external schema file.
  if (typeof def === 'string') {
    rv._def = cjson.load(def);
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
  addDefaultValues(rv._schema, rv._instance);
  importEnvironment(rv);
  importArguments(rv);

  return rv;
};

// Add a type with a validatino function
// A converter function is optional
convict.addFormat = function(name, validate, coerce) {
  if (typeof name === 'object') {
    name = name.name;
    validate = name.validate;
    coerce = name.coerce;
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

convict.addFormats = function(formats) {
  Object.keys(formats).forEach(function(type) {
    convict.addFormat(type, formats[type].validate, formats[type].coerce);
  });
};

module.exports = convict;
