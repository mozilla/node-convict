/*
 */

const cjson     = require('cjson');
const fs        = require('fs');
const validator = require('validator');
const moment    = require('moment');

var check = validator.check;

// format can be a:
// - predefine type, as seen below
// - an array of enumerated values, e.g. ["production", "development", "testing"]
// - or if omitted, the `typeof` the default value

var types = {
  int: function(name, x) {
    check(x, name + ': must be an integer, got ' + JSON.stringify(x)).isInt();
  },
  nat: function(name, x) {
    check(x, name + ': must be a positive integer, got ' + JSON.stringify(x)).isInt().min(0);
  },
  port: function(name, x) {
    check(x, name + ': Ports must be within range 1 - 65535, got ' + JSON.stringify(x)).isInt().min(1).max(65535);
  },
  url: function(name, x) {
    check(x, name + ': must be a URL, got ' + JSON.stringify(x)).isUrl();
  },
  email: function(name, x) {
    check(x, name + ': must be an email address, got ' + JSON.stringify(x)).isEmail();
  },
  ipaddress: function(name, x) {
    check(x, name + ': must be an IP address, got ' + JSON.stringify(x)).isIP();
  },
  duration: function(name, x) {
    check(x, name + ': must be a positive integer, got ' + JSON.stringify(x)).isInt().min(0);
  },
  date: function(name, x) {
    check(x, name + ': must be a positive integer, got ' + JSON.stringify(x)).isInt().min(0);
  }
};

function validate (instance, schema, errors) {
  Object.keys(schema.properties).reduce(function(previousErrors, name) {
    var p = schema.properties[name];
    if (p.properties) {
      var kids = instance[name] || {};
      validate(kids, p, previousErrors);
    } else {
      try {
        p.format(instance[name]);
      } catch (e) {
        previousErrors.push(e);
      }
    }
    return previousErrors;
  }, errors);

  return errors;
}

// helper for checking that a value is in the list of valid options
function contains (options, name, x) {
  check(x, name + ': Instance is ' + JSON.stringify(x) + ', not one of the possible values: ' + JSON.stringify(options)).isIn(options);
}

var BUILT_INS = [Object, Array, String, Number, Boolean];

function normalizeSchema (name, o, props, fullName, env) {
  if (typeof o === 'object' && !Array.isArray(o) && typeof o.default === 'undefined') {
    props[name] = {
      properties: {},
    };
    Object.keys(o).forEach(function(k) {
      normalizeSchema(k, o[k], props[name].properties, fullName + "." + k, env);
    });
    return;
  } else if (typeof o !== 'object' || Array.isArray(o) || o === null) {
    o = { default: o };
  }

  if (typeof o === 'object') {
    props[name] = o;

    if (o.env) {
      if (env[o.env]) {
        throw new Error("'" + fullName + "' reuses an env variable: " + o.env);
      }
      env[o.env] = fullName;
    }

    if (BUILT_INS.indexOf(o.format) >= 0) {
      // if the format property is a builtin JavaScript type, format is intance of
      var con = o.format;
      o.format = function(x) {
        check(x.constructor, fullName + ' should be an instance of ' + con).equals(con);
      };
    } else if (typeof o.format === 'string') {
      // store declared type
      o.type = o.format;
      // use a predefined type
      o.format = types[o.format].bind(null, fullName);
    } else if (Array.isArray(o.format)) {
      // check that value is a valid option
      o.format = contains.bind(null, o.format, fullName);
    } else if (typeof o.format === 'function') {
      o.format = o.format.bind(null, fullName);
    }

    if (!o.format) {
      // default format is the typeof the default value
      var type = typeof o.default;
      o.format = function(x) { check(typeof x, fullName + ' should be of type ' + type).equals(type); };
    }
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

function addDefaultValues(schema, c) {
  Object.keys(schema.properties).forEach(function(name) {
    var p = schema.properties[name];
    if (p.properties) {
      var kids = c[name] || {};
      addDefaultValues(p, kids);
      if (Object.keys(kids).length) c[name] = kids;
    } else {
      if (!c[name] && typeof p.default !== 'undefined') c[name] = coerce(name, p.default, schema);
    }
  });
}

function isObj(o) { return (typeof o === 'object' && o !== null); }

function overlay(from, to, schema) {
  Object.keys(from).forEach(function(k) {
    // leaf
    if (Array.isArray(from[k]) || !isObj(from[k])) to[k] = coerce(k, from[k], schema);
    // not
    else {
      if (!isObj(to[k])) to[k] = {};
      overlay(from[k], to[k]);
    }
  });
}

function getType(schema, path) {
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
  return o ? (o.type ? o.type : typeof o.default) : null;
}

function coerce(k, v, schema) {
  // magic coerceing
  if (typeof v === 'string') {
    switch (getType(schema, k)) {
    case 'port':
    case 'int': v = parseInt(v, 10); break;
    case 'number': v = parseFloat(v); break;
    case 'boolean': v = ((v === 'false') ? false : true); break;
    case 'date': v = moment(v).valueOf(); break;
    case 'duration':
      var split = v.split(' ');
      if (!split[1].match(/s$/)) split[1] += 's';
      v = moment.duration(parseInt(split[0], 10), split[1]).valueOf();
      break;
    }
  }
  return v;
}

module.exports = function convict(def) {
  var rv = {
    template: function() {

    },
    toString: function() {
      return JSON.stringify(this._instance, null, 2);
    },
    get: function(path) {
      var o = JSON.parse(JSON.stringify(this._instance));
      if (path) {
        var ar = path.split('.');
        while (ar.length) {
          var k = ar.shift();
          if (typeof o[k] !== undefined) o = o[k];
          if (o === undefined) break;
        }
      }
      if (o === undefined) {
        throw new Error("cannot find configuration param '" + path + "'");
      }
      return o;
    },
    has: function(path) {
      try {
        this.get(path);
        return true;
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
      // environment always overrides config files
      importEnvironment(rv);
      return this;
    },
    loadFile: function(paths) {
      var self = this;
      if (!Array.isArray(paths)) paths = [paths];
      paths.forEach(function(path) {
        overlay(cjson.load(path), self._instance);
      });
      // environment always overrides config files
      importEnvironment(rv);
      return this;
    },
    validate: function() {
      var errors = validate(this._instance, this._schema, []);
      if (errors.length) {
        var errBuf = '';
        for (var i = 0; i < errors.length; i++) {
          if (errBuf.length) errBuf += '\n';
          var e = errors[i];
          // get the property name in dot notation
          if (e.uri) {
            errBuf += e.uri.split('/').slice(1).join('.') + ': ';
          }
          if (e.message) errBuf += e.message;
          if (e.details) {
            errBuf +=  ': ' + ((typeof e.details === 'string') ?
                       e.details : JSON.stringify(e.details));
          }
        }
        throw new Error(errBuf);
      }
      return this;
    }
  };

  rv._def = def;

  // build up current config from definition
  rv._schema = {
    properties: {}
  };

  rv._env = {};

  Object.keys(def).forEach(function(k) {
    normalizeSchema(k, def[k], rv._schema.properties, k, rv._env);
  });

  rv._instance = {};
  addDefaultValues(rv._schema, rv._instance);
  importEnvironment(rv);
  console.log(rv._instance);

  return rv;
};

// expose node-validator check function
module.exports.check = check;

