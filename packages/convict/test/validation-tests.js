'use strict';

const path = require('path');
require('must');

describe('configuration files contain properties not declared in the schema', function() {
  const convict = require('../');
  let config = convict({
    foo: {
      doc: 'testing',
      format: String,
      default: 'testing'
    },
    bar: {
      doc: 'testing',
      format: String,
      default: 'testing'
    },
    nested: {
      level1: {
        doc: 'testing',
        format: String,
        default: 'testing'
      },
      level2:{
        level3:{
          doc:'testing',
          format:String,
          default:'testing'
        }
      }
    }
  });

  it('must not throw, if properties in config file match with the schema', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_correct.json'));
    (function() {
      config.validate({
        allowed: 'strict'
      });
    }).must.not.throw();
  });

  it('must not throw, if the option to check for non schema properties is set by default but must display warnings', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_incorrect.json'));
    (function() {
      config.validate();
    }).must.not.throw();
  });
  it('must not throw, if the option to check for non schema properties is not specified and must display warnings', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_incorrect.json'));
    (function() {
      config.validate();
    }).must.not.throw();
  });
  it('must throw, if properties in config file do not match the properties declared in the schema', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_incorrect.json'));
    (function() {
      config.validate({
        allowed: 'strict'
      });
    }).must.throw(/not declared/);
  });
  it('must display warning, if properties in config file do not match the properties declared in the schema', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_incorrect.json'));
    (function() {
      config.validate({
        allowed: 'warn'
      });
    }).must.not.throw();
  });
  it('must throw, if properties in instance do not match the properties declared in the schema and there are incorrect values', function() {
    (function() {
      config.load({
        'foo': 58,
        'bar': 98,
        'nested': {
          'level1_1': 'undeclared'
        },
        'undeclared': 'this property is not declared in the schema'
      });
      config.validate({
        allowed: 'strict'
      });
    }).must.throw();
  });
  let message = '';
  function myOutput(str) {
    message += str;
  }
  it('must not break when a failed validation follows an undeclared property and must display warnings, and call the user output function', function() {
    (function() {
      convict.addFormat('foo', function(val) {
        if (val !== 0) { throw new Error('Validation error'); }
      });

      let config = convict({
        test2: {
          one: { default: 0 },
          two: {
            format: 'foo',
            default: 0
          }
        }
      });

      // if this key is a number, the error occurs; if it is a string, it does not
      // i don't know why. the deep nesting is also required.
      config.load({'0': true});
      config.load({ test2: { two: 'two' } });
      config.validate({
        output: myOutput
      });
    }).must.throw(/Validation error/);
  });
  it('must use the user output function when it was declared', function() {
    message.must.eql("\u001b[33;1mWarning:\u001b[0m configuration param '0' not declared in the schema");
  });
  it('must only accept function when user set an output function', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_incorrect.json'));
    (function() {
      config.validate({
        output: 312
      });
    }).must.throw(/options\.output is optionnal and must be a function\./);
  });
  it('must not break on consecutive overrides', function() {
    (function() {
      let config = convict({
        object: {
          doc: 'testing',
          format: Object,
          default: {}
        }
      });
      config.loadFile([
        path.join(__dirname, 'cases/object_override1.json'),
        path.join(__dirname, 'cases/object_override2.json')
      ]);
      config.validate();
    }).must.not.throw();
  })
});

describe('setting specific values', function() {
  const convict = require('../');
  it('must not show warning for undeclared nested object values', function() {
    (function() {
      let config = convict({
        object: {
          doc: 'testing',
          format: Object,
          default: {}
        }
      });
      config.set('object', { foo: 'bar' });
      config.validate({ allowed: 'strict' });
    }).must.not.throw();
  });
  it('must show warning for undeclared property names similar to nested declared property name', function() {
    (function() {
      let config = convict({
        parent: {
          object: {
            doc: 'testing',
            format: Object,
            default: {}
          }
        },
      });
      config.set('parent.object', { foo: 'bar' });
      config.set('parent_object', { foo: 'bar' });
      config.validate({ allowed: 'strict' });
    }).must.throw();
  });
  it('must show warning for undeclared property names starting with declared object properties', function() {
    (function() {
      let config = convict({
        object: {
          doc: 'testing',
          format: Object,
          default: {}
        }
      });
      config.set('object', { foo: 'bar' });
      config.set('objectfoo', { foo: 'bar' });
      config.validate({ allowed: 'strict' });
    }).must.throw();
  });
});

describe('schema contains an object property with a custom format', function() {
  const convict = require('../');
  it('must throw if a nested object property has an undeclared format', function() {
    (function() {
      const config = convict({
        object: {
          doc: 'testing',
          format: 'undefinedFormat',
          default: {
            bar: 'baz',
          },
        },
      });

      config.validate({ allowed: 'strict' });
    }).must.throw();
  });
  it('must not throw if an object property has a nested value and a custom format', function() {
    (function() {
      convict.addFormat('foo', function() {});
      const config = convict({
        object: {
          doc: 'testing',
          format: 'foo',
          default: {
            bar: 'baz',
          },
        },
      });

      config.validate({ allowed: 'strict' });
    }).must.not.throw();
  });
  it('must not throw if a declared object property with a custom format and with nested values is set', function() {
    (function() {
      convict.addFormat('foo', function() {});
      const config = convict({
        object: {
          doc: 'testing',
          format: 'foo',
          default: {
            bar: 'baz',
          },
        },
      });

      config.set('object', { bar: '', baz: 'blah' });
      config.validate({ allowed: 'strict' });
    }).must.not.throw();
  });

  it.skip("must not throw if an object's default value property name contains a period", function() {
    (function() {
      const config = convict({
        object: {
          doc: 'default value contains property name that contains a period',
          format: Object,
          default: {
            'foo.bar': ''
          }
        }
      });

      config.validate();
    }).must.not.throw();
  });

});
