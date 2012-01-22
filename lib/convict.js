// TODO:
//  * nesting
//  * environment
//  * all sorts of error handling

const
orderly = require('orderly'),
JSV = require("jsv").JSV.createEnvironment();

function buildSchema(name, o, props) {
  if (o && o.format && typeof o.format === 'string') {
    var schema = orderly.parse(o.format);
    if (!schema.optional) schema.required = true;
    props[name] = schema;
  } else {
    console.log("bad nesting");
  }
}

function addDefaultValues(schema, c) {
  Object.keys(schema.properties).forEach(function(name) {
    p = schema.properties[name];
    if (!c[name] && p.default) c[name] = p.default
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
    buildSchema(k, def[k], rv._schema.properties);    
  });

  var report = JSV.validate({}, rv._schema);

  rv._instance = report.instance.getValue();
  addDefaultValues(rv._schema, rv._instance)

  return rv;
};
