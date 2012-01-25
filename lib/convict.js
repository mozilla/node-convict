// TODO:
//  * nesting
//  * environment
//  * all sorts of error handling

const
orderly = require('orderly'),
JSV = require("jsv").JSV.createEnvironment();

function buildSchema(name, o, props, fullName) {
  if (typeof o === 'string' || (o && o.format && typeof o.format === 'string')) {
    var fmt = (typeof o === 'string') ? o : o.format;
    try {
      var schema = orderly.parse(fmt);
      if (!schema.optional) schema.required = true;
      props[name] = schema;
    } catch(e) {
      throw "'" + fullName + "' has an invalid format: " + e.toString();
    } 
  } else {
    props[name] = {
      properties: {},
      additionalProperties: false
    };
    Object.keys(o).forEach(function(k) {
      buildSchema(k, o[k], props[name].properties, fullName + "." + k);    
    });
  }
}

function addDefaultValues(schema, c) {
  Object.keys(schema.properties).forEach(function(name) {
    p = schema.properties[name];
    if (p.properties) {
      var kids = c[name] || {};
      addDefaultValues(p, kids);
      if (Object.keys(kids).length) c[name] = kids;
    } else {
      if (!c[name] && p.default) c[name] = p.default
    }
  });
}

module.exports = function(def) {
  var rv = {
    toString: function() {
      return JSON.stringify(this._instance, null, 2)      
    },
    get: function(v) {
      if (!v) return JSON.parse(JSON.stringify(this._instance));
      // XXX: write me
      throw "not implemented";
    },
    read: function(conf) {
      // XXX: write me
      throw "not implemented";
    },
    readFile: function(path, cb) {
      // XXX: write me
      throw "not implemented";
    }
  };
  // XXX validate definition

  // build up current config from definition
  rv._schema = {
    properties: {},
    additionalProperties: false
  };
  Object.keys(def).forEach(function(k) {
    buildSchema(k, def[k], rv._schema.properties, k);    
  });

  var report = JSV.validate({}, rv._schema);

  rv._instance = report.instance.getValue();
  addDefaultValues(rv._schema, rv._instance)

  return rv;
};
