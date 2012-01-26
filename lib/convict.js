// TODO:
//  * nesting
//  * environment
//  * all sorts of error handling

const
orderly = require('orderly'),
JSV = require("JSV").JSV.createEnvironment(),
cjson = require('cjson'),
fs = require('fs');

function buildSchema(name, o, props, fullName, env) {
  if (typeof o === 'string' || (o && o.format && typeof o.format === 'string')) {
    var fmt = (typeof o === 'string') ? o : o.format;
    try {
      var schema = orderly.parse(fmt);
      if (!schema.optional) schema.required = true;
      props[name] = schema;
    } catch(e) {
      throw "'" + fullName + "' has an invalid format: " + e.toString();
    }
    if (o.env) {
      if (env[o.env]) {
        throw "'" + fullName + "' reuses an env variable: " + o.env
      }
      env[o.env] = fullName;
    }
  } else {
    props[name] = {
      properties: {},
      additionalProperties: false
    };
    Object.keys(o).forEach(function(k) {
      buildSchema(k, o[k], props[name].properties, fullName + "." + k, env);
    });
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
      if (!c[name] && typeof p.default !== 'undefined') c[name] = p.default
    }
  });
}

function overlay(from, to) {
  function isObj(o) { return (typeof o === 'object' && o !== null); }

  Object.keys(from).forEach(function(k) {
    // leaf
    if (!isObj(from[k])) to[k] = from[k];
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
  return (o && o.type) ? o.type : null;
}

module.exports = function(def) {
  var rv = {
    template: function() {

    },
    toString: function() {
      return JSON.stringify(this._instance, null, 2)
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
      if (o === undefined) throw "cannot find configuration param '" + path + "'";
      return o;
    },
    set: function(k, v) {
      // magic casting
      if (typeof v === 'string') {
        switch (getType(this._schema, k)) {
        case 'integer': v = parseInt(v); break;
        case 'number': v = parseFloat(v); break;
        case 'boolean': v = ((v === 'false') ? false : true); break;
        }
      }
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
      overlay(c, this._instance);
      return this;
    },
    loadFile: function(paths) {
      var self = this;
      if (!Array.isArray(paths)) paths = [ paths ];
      paths.forEach(function(path) {
        overlay(cjson.load(path), self._instance);
      });
      return this;
    },
    validate: function() {
      var report = JSV.validate(this._instance, this._schema);
      if (report.errors.length) {
        var errBuf = "";
        for (var i = 0; i < report.errors.length; i++) {
          if (errBuf.length) errBuf += "\n";
          var e = report.errors[i];
          // get the property name in dot notation
          if (e.uri) {
            errBuf += e.uri.split('/').slice(1).join('.') + ": ";
          }
          if (e.message) errBuf += e.message + ": ";
          if (e.details) {
            errBuf += ((typeof e.details === 'string') ?
                       e.details : JSON.stringify(e.details));
          }
        }
        throw errBuf;
      }
      return this;
    }
  };
  // XXX validate definition

  rv._def = def;

  // build up current config from definition
  rv._schema = {
    properties: {},
    additionalProperties: false
  };

  rv._env = { };

  Object.keys(def).forEach(function(k) {
    buildSchema(k, def[k], rv._schema.properties, k, rv._env);
  });

  var report = JSV.validate({}, rv._schema);

  rv._instance = report.instance.getValue() || {};
  addDefaultValues(rv._schema, rv._instance)
  importEnvironment(rv);

  return rv;
};
