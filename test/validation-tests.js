require('must');

describe('configuration files contain properties not declared in the schema', function() {
  const convict = require('../');
  var config = convict({
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
    config.loadFile(__dirname + '/cases/validation_correct.json');
    (function() {
      config.validate({
        strict: true
      });
    }).must.not.throw();
  });

  it('must not throw, if the option to check for non schema properties is set to false', function() {
    config.loadFile(__dirname + '/cases/validation_incorrect.json');
    (function() {
      config.validate({
        strict: false
      });
    }).must.not.throw();
  });
  it('must not throw, if the option to check for non schema properties is not specified', function() {
    config.loadFile(__dirname + '/cases/validation_incorrect.json');
    (function() {
      config.validate();
    }).must.not.throw();
  });
  it('must throw, if properties in config file do not match the properties declared in the schema', function() {
    config.loadFile(__dirname + '/cases/validation_incorrect.json');
    (function() {
      config.validate({
        strict: true
      });
    }).must.throw(/not declared/);
  });
  it('must not break when a failed validation follows an undeclared property', function() {
    (function() {
      convict.addFormat('foo', function (val) {
        if (val !== 0) { throw new Error('Validation error'); }
      });

      var config = convict({
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
      config.validate();
    }).must.throw(/Validation error/);
  });
  it('must not break on consecutive overrides', function () {
    (function() {
      var config = convict({
        object: {
          doc: 'testing',
          format: Object,
          default: {}
        }
      });
      config.loadFile([
        __dirname + '/cases/object_override1.json',
        __dirname + '/cases/object_override2.json'
      ]);
      config.validate();
    }).must.not.throw();
  })
});
