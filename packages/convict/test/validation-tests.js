'use strict';

const chai = require('chai');
const expect = chai.expect;

const path = require('path');

const strictMode = {
  allowed: 'strict'
};

const new_require = require('./new_require.js');
const convict = new_require('../');

describe('configuration files contain properties not declared in the schema', function() {
  let conf = convict({
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

  it('must have the default getters order', function() {
    const order = ['default', 'value', 'env', 'arg', 'force'];
    expect(convict.getGettersOrder()).to.be.deep.equal(order);
  });

  it('must not throw, if properties in config file match with the schema', function() {
    conf.loadFile(path.join(__dirname, 'fixtures/validation_correct.json'));

    expect(() => conf.validate(strictMode)).to.not.throw();
  });

  it('must not throw, if the option to check for non schema properties is set by default but must display warnings', function() {
    conf.loadFile(path.join(__dirname, 'fixtures/validation_incorrect.json'));

    expect(() => conf.validate()).to.not.throw();
  });

  it('must not throw, if the option to check for non schema properties is not specified and must display warnings', function() {
    conf.loadFile(path.join(__dirname, 'fixtures/validation_incorrect.json'));

    expect(() => conf.validate()).to.not.throw();
  });

  it('must throw, if properties in config file do not match the properties declared in the schema', function() {
    conf.loadFile(path.join(__dirname, 'fixtures/validation_incorrect.json'));

    const expected = 'Validate failed because wrong value(s):'
    + "\n  - configuration param 'undeclared' not declared in the schema"
    + "\n  - configuration param 'nested.level1_1' not declared in the schema";

    expect(() => conf.validate(strictMode)).to.throw(expected);
  });

  it('must display warning, if properties in config file do not match the properties declared in the schema', function() {
    const opts = {
      allowed: 'warn'
    };
    conf.loadFile(path.join(__dirname, 'fixtures/validation_incorrect.json'));

    expect(() => conf.validate(opts)).to.not.throw();
  });

  it('must throw, if properties in instance do not match the properties declared in the schema and there are incorrect values', function() {
    const param = {
      'foo': 58,
      'bar': 98,
      'nested': {
        'level1_1': 'undeclared'
      },
      'undeclared': 'this property is not declared in the schema'
    };

    expect(() => conf.load(param)).to.not.throw();

    const expected = 'Validate failed because wrong value(s):'
      + '\n  - foo: must be of type String: value was 58, getter was `value`'
      + '\n  - bar: must be of type String: value was 98, getter was `value`'
      + "\n  - configuration param 'undeclared' not declared in the schema"
      + "\n  - configuration param 'nested.level1_1' not declared in the schema";

    expect(() => conf.validate(strictMode)).to.throw(expected);
  });

  let message = '';
  function myOutput(str) {
    message += str;
  }

  it('must not break when a failed validation follows an undeclared property and must display warnings, and call the user output function', function() {
    expect(function() {
      convict.addFormat('foo', function(val) {
        if (val !== 0) { throw new Error('Validation error'); }
      });

      const conf = convict({
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
      conf.load({'0': true});
      conf.load({ test2: { two: 'two' } });
      conf.validate({
        output: myOutput
      });
    }).to.throw('test2.two: Validation error: value was "two"');
  });

  it('must use the user output function when it was declared', function() {
    const expected = "\u001b[33;1mWarning:\u001b[0m\n  - configuration param '[0]' not declared in the schema";

    expect(message).to.equal(expected);
  });

  it('must only accept function when user set an output function', function() {
    const opts = {
      output: 312
    };
    conf.loadFile(path.join(__dirname, 'fixtures/validation_incorrect.json'));

    expect(() => conf.validate(opts)).to.throw('options.output is optionnal and must be a function.');
  });

  it('must not break on consecutive overrides', function() {
    const schema = {
      object: {
        doc: 'testing',
        format: Object,
        default: {}
      }
    };
    const conf = convict(schema);

    conf.loadFile([
      path.join(__dirname, 'fixtures/object_override1.json'),
      path.join(__dirname, 'fixtures/object_override2.json')
    ]);

    expect(() => conf.validate()).to.not.throw();
  })
});

describe('setting specific values', function() {
  const convict = require('../');
  let myOwnConf; // init in beforeEach

  // >> init myOwnConf before each it
  beforeEach(function() {
    const schema = {
      object: {
        doc: 'testing',
        format: Object,
        default: {}
      }
    };
    myOwnConf = convict(schema);
  });
  // <<

  it('must not show warning for undeclared nested object values', function() {
    myOwnConf.set('object', { foo: 'bar' });

    expect(() => myOwnConf.validate(strictMode)).to.not.throw();
  });

  it('must show warning for undeclared property names similar to nested declared property name', function() {
    myOwnConf.set('parent.object', { foo: 'bar' });
    myOwnConf.set('parent_object', { foo: 'bar' });

    const expected = 'Validate failed because wrong value(s):'
      + "\n  - configuration param 'parent_object.foo' not declared in the schema"
      + "\n  - configuration param 'parent.object.foo' not declared in the schema";

    expect(() => myOwnConf.validate(strictMode)).to.throw(expected);
  });

  it('must show warning for undeclared property names starting with declared object properties', function() {
    myOwnConf.set('object', { foo: 'bar' });
    myOwnConf.set('objectfoo', { foo: 'bar' });

    expect(() => myOwnConf.validate(strictMode)).to.throw("configuration param 'objectfoo.foo' not declared in the schema");
  });
});

describe('schema contains an object property with a custom format', function() {
  const convict = require('../');
  const schemaWithFoo22Format = {
    object: {
      doc: 'testing',
      format: 'foo22',
      default: {
        bar: 'baz',
      },
    },
  };

  it('must throw if a nested object property has an undeclared format', function() {
    expect(() => convict(schemaWithFoo22Format)).to.throw('object: uses an unknown format type (actual: "foo22")');
  });

  it('must not throw if an object property has a nested value and a custom format and after set a object property with a custom format', function() {
    convict.addFormat('foo22', function() {})
    const conf = convict(schemaWithFoo22Format);

    // must validate before set
    expect(() => conf.validate(strictMode)).to.not.throw();

    conf.set('object', { bar: '', baz: 'blah' });

    // must validate after set
    expect(() => conf.validate(strictMode)).to.not.throw();
  });

  it('must throw if a custom format foo is existing and if rewrite = false', function() {
    expect(() => 
      convict.addFormat('foo22', function() {})
    ).to.throw('The format name "foo22" is already registered. Set the 4th argument (rewrite) of `addFormat` at true to skip this error.');
    expect(() => 
      convict.addFormat('foo22', function() {}, null, true) // true = rewrite = throw
    ).to.not.throw();
  });

  it("must not throw if an object's default value property name contains a period", function() {
    const schema = {
      object: {
        doc: 'default value contains property name that contains a period',
        format: Object,
        default: {
          'foo.bar': ''
        }
      }
    };
    const conf = convict(schema);

    expect(() => conf.validate()).to.not.throw();
  });

  it('must throw because unexpected error (-> convict internal error)', function() {
    const message = 'this is a hack to make a fake convict internal error';

    convict.addFormat('hack', function(name, schema) {
      // we prevent that error : will be catch in original _cvtValidateFormat function
      //                     and will be convert to FORMAT_INVALID Error.
      schema._cvtValidateFormat = function(value) {
        throw new Error(message);
      };
    });
    const conf = convict({
      object: {
        format: 'hack',
        default: ''
      }
    });

    // init the hack (replace _cvtValidateFormat by our own function)
    expect(() => conf.validate(strictMode)).not.to.throw();

    // run the hack function
    expect(() => conf.validate(strictMode)).to.throw(message + ' \x1b[33;1m[/!\\ this is probably convict internal error]\x1b[0m');
  });
});
