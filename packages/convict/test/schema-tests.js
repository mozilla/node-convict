'use strict';

const chai = require('chai');
const expect = chai.expect;

const path = require('path');
const new_require = require('./new_require.js');
const convict = new_require('../');

describe('convict schema', function() {
  let myOwnConf; // init in beforeEach
  const requiredPropConf = convict({
    foo: {
      none: {
        format: String,
        default: undefined
      },
      required: {
        format: '*',
        default: undefined,
        required: true
      },
      none2: {
        format: String
      },
      none3: {
        format: 'String'
      },
      required2: {
        format: String,
        required: true
      }
    }
  });
  requiredPropConf.set('foo.required2', 'ok');

  it('must have the default getters order', function() {
    const order = ['default', 'value', 'env', 'arg', 'force'];
    expect(convict.getGettersOrder()).to.be.deep.equal(order);
  });

  it('must parse a config specification from a file', function() {
    const filepath = path.join(__dirname, 'schema.json');

    expect(() => convict(filepath)).to.not.throw();
  });

  it('must parse a specification with built-in formats', function() {
    const filepath = path.join(__dirname, 'fixtures/schema-built-in-formats.json');

    expect(() => convict(filepath)).to.not.throw();
  });

  it('must throw when parsing a specification that reuses a command-line argument', function() {
    const schema = {
      foo: {
        default: 'a',
        arg: 'BAZ'
      },
      bar: {
        default: 'a',
        arg: 'BAZ'
      }
    };

    expect(() => convict(schema)).to.throw('bar: uses a already used value in "arg" getter (actual: "BAZ")');
  });

  it('requiredPropConf must be valid', function() {
    expect(() => requiredPropConf.validate()).to.not.throw();
  });

  it('must throw if string property is required but undefined', function() {
    const requiredStringandUndefined = convict({
      foo: {
        none: {
          format: String,
          required: true,
          default: undefined
        },
        none2: {
          format: String,
          required: true
        }
      }
    });

    console.log(requiredStringandUndefined.getSchema());
    console.log(requiredStringandUndefined.getSchema());

    const expected = 'Validate failed because wrong value(s):\n'
      + '  - foo.none: must be of type String\n'
      + '  - foo.none2: must be of type String';
    expect(() => requiredStringandUndefined.validate()).to.throw(expected);
  });

  it('must accept process arguments and environment variables as parameters', function() {
    const conf = convict({
      foo: {
        format: String,
        default: 'DEFAULT',
        env: 'FOO',
        arg: 'foo',
      },
      bar: {
        format: String,
        default: 'DEFAULT',
        env: 'BAR',
        arg: 'bar'
      }
    }, { args: ['--bar', 'baz'], env: { FOO: 'foz' } });

    expect(conf.getArgs()).to.deep.equal(['--bar', 'baz']);
    expect(conf.getEnv()).to.deep.equal({ FOO: 'foz' });
    expect(conf.get('bar')).to.equal('baz');
    expect(conf.get('foo')).to.equal('foz');
  });

  describe('after being parsed', function() {
    // >> init myOwnConf before each it
    beforeEach(function() {
      myOwnConf = convict(path.join(__dirname, 'schema.json'));
    });
    // <<

    it('must be valid', function() {
      expect(() => myOwnConf.validate()).to.not.throw();
    });

    it('requiredPropConf must be valid again', function() {
      expect(() => requiredPropConf.validate()).to.not.throw();
    });

    it('must throw if `_cvtProperties` (reserved keyword) is used', function() {
      const invalidSchema = {
        _cvtProperties: {
          format: String,
          default: 'DEFAULT'
        }
      };

      expect(() => convict(invalidSchema)).to.throw("_cvtProperties: '_cvtProperties' is reserved word of convict, it can be used like property name.");
    });

    const expectedProperties = {
      'foo': {
        'bar': 7,
        'baz': {
          'bing': 'foo',
          'name with spaces': {
            'name_with_underscores': true
          }
        }
      }
    };

    it('must export all its properties as Object', function() {
      expect(myOwnConf.getProperties()).to.deep.equal(expectedProperties);
    });

    it('must export all its properties as a string', function() {
      const expected = JSON.stringify(expectedProperties, null, 2);

      expect(myOwnConf.toString()).to.equal(expected);
    });

    const expectedSchema = {
      'foo': {
        'bar': {
          'default': 7,
          'format': 'Number'
        },
        'baz': {
          'bing': {
            'default': 'foo',
            'format': 'String'
          },
          'name with spaces': {
            'name_with_underscores': {
              'default': true,
              'format': 'Boolean'
            }
          }
        }
      }
    };

    const expectedDataSchema = {
      '_cvtProperties': {
        'foo': {
          '_cvtProperties': {
            'bar': {
              'default': 7,
              'format': 'Number',
              '_cvtCoerce': '[FunctionReplacement]',
              '_cvtValidateFormat': '[FunctionReplacement]',
              '_cvtGetOrigin': '[FunctionReplacement]'
            },
            'baz': {
              '_cvtProperties': {
                'bing': {
                  'default': 'foo',
                  'format': 'String',
                  '_cvtCoerce': '[FunctionReplacement]',
                  '_cvtValidateFormat': '[FunctionReplacement]',
                  '_cvtGetOrigin': '[FunctionReplacement]'
                },
                'name with spaces': {
                  '_cvtProperties': {
                    'name_with_underscores': {
                      'default': true,
                      'format': 'Boolean',
                      '_cvtCoerce': '[FunctionReplacement]',
                      '_cvtValidateFormat': '[FunctionReplacement]',
                      '_cvtGetOrigin': '[FunctionReplacement]'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    it('must export the schema as Object', function() {
      expect(myOwnConf.getSchema()).to.deep.equal(expectedSchema);
    });

    it('must parse exported schema', function() {
      expect(() => convict(myOwnConf.getSchema())).to.not.throw();
    });

    it('must returns the data schema (like is stored in convict instance) with debug=true', function() {
      const dataSchema = convertFunctionToString(myOwnConf.getSchema(true));
      expect(dataSchema).to.deep.equal(expectedDataSchema);
    });

    it('must export the schema as a JSON string', function() {
      const stringify = (obj) => JSON.stringify(obj, null, 2);

      expect(myOwnConf.getSchemaString()).to.deep.equal(stringify(expectedSchema));
    });

    describe('.has()', function() {
      it('must not have undefined properties', function() {
        expect(myOwnConf.has('foo.bar.madeup')).to.be.false;
      });

      it('must work on undeclared property', function() {
        expect(requiredPropConf.has('foo.bing')).to.be.false;
        requiredPropConf.set('foo.bing', undefined);
        expect(requiredPropConf.has('foo.bing')).to.be.false;
        requiredPropConf.set('foo.bing', 'no');
        expect(requiredPropConf.has('foo.bing')).to.be.true;
      });

      it('must not have properties specified with a default of undefined', function() {
        expect(requiredPropConf.has('foo.none')).to.be.false;
        expect(requiredPropConf.has('foo.required')).to.be.true;
        expect(requiredPropConf.get('foo.required')).to.be.undefined;
      });

      it('must throw with', function() {
        expect(requiredPropConf.has('foo.none')).to.be.false;
        expect(requiredPropConf.has('foo.required')).to.be.true;
        expect(requiredPropConf.get('foo.required')).to.be.undefined;
      });
    });

    describe('.get()', function() {
      it('must find a nested value', function() {
        expect(myOwnConf.get('foo.bar')).to.equal(7);
      });

      it('must be not accept an array with magicoerce', function() {
        myOwnConf.set('foo.bar', ['7']);
        expect(() => myOwnConf.validate()).to.throw('foo.bar: must be of type Number: value was ["7"], getter was `value`');
      });

      it('must handle three levels of nesting', function() {
        expect(myOwnConf.get('foo.baz.bing')).to.equal('foo');
      });

      it('must handle names with spaces and underscores', function() {
        const key = 'foo.baz.name with spaces.name_with_underscores';

        expect(myOwnConf.get(key)).to.be.true;
      });

      it('must throw if conf doesn\'t exist', function() {
        expect(() => myOwnConf.get('foo.no')).to.throw('foo.no: cannot find "foo.no" property because "foo.no" is not defined.');
      });
    });

    describe('.default()', function() {
      // >> init myOwnConf before each it
      // Temporarily modify a property while testing default()
      beforeEach(function() {
        myOwnConf.set('foo.bar', 8);
      });
      afterEach(function() {
        myOwnConf.set('foo.bar', 7);
      });
      // <<

      it('must report the default value of a property', function() {
        expect(myOwnConf.get('foo.bar')).to.equal(8); // Modified
        expect(myOwnConf.default('foo.bar')).to.equal(7);
        expect(myOwnConf.get('foo.bar')).to.equal(8);
      });

      it('must throw if key doesn\'t exist', function() {
        expect(() => myOwnConf.default('foo.no')).to.throw('foo.no.default: cannot find "foo.no" property because "foo.no" is not defined.');
      });

      describe('when acting on an Object property', function() {
        // >> init myOwnConf before each it
        beforeEach(function() {
          myOwnConf = convict(path.join(__dirname, 'fixtures/schema-built-in-formats.json'));
        });
        // <<

        it('must report the default value of the property', function() {
          expect(myOwnConf.get('someObject')).to.deep.equal({});
          expect(myOwnConf.default('someObject')).to.deep.equal({});
        });

        it('must not be altered by calls to .set()', function() {
          myOwnConf.set('someObject.five', 5);

          expect(myOwnConf.default('someObject')).to.deep.equal({});
          expect(() => myOwnConf.default('someObject.five')).to.throw('someObject.five.default: cannot find "someObject" property because "someObject" is not defined.');
        });

        it('must not be altered by calls to .load()', function() {
          myOwnConf.load({someObject: {five: 5}});

          expect(myOwnConf.default('someObject')).to.deep.equal({});
          expect(() => myOwnConf.default('someObject.five')).to.throw('someObject.five.default: cannot find "someObject" property because "someObject" is not defined.');
        });
      });
    });

    describe('.reset()', function() {
      // >> init myOwnConf before each it
      // Temporarily modify a property while testing default()
      beforeEach(function() {
        myOwnConf.set('foo.bar', 8);
      });
      afterEach(function() {
        myOwnConf.set('foo.bar', 7);
      });
      // <<

      it('must reset the property to its default value', function() {
        expect(myOwnConf.get('foo.bar')).to.equal(8); // Modified
        expect(myOwnConf.getOrigin('foo.bar')).to.equal('value');

        myOwnConf.reset('foo.bar');

        expect(myOwnConf.get('foo.bar')).to.equal(7);
        expect(myOwnConf.getOrigin('foo.bar')).to.equal('default');
      });

      it('must throw if key doesn\'t exist', function() {
        expect(() => myOwnConf.reset('foo.no')).to.throw('foo.no.default: cannot find "foo.no" property because "foo.no" is not defined.');
      });
    });

  });
});

describe('convict used multiple times on one schema', function() {
  const convict = require('../');
  let schema = {
    publicServerAddress:  {
      doc: 'The public-facing server address',
      format: String,
      default: 'localhost:5000'
    }
  };
  expect(function() {
    convict(schema);
    convict(schema);
  }).to.not.throw();
});

// replace Function by `[FunctionReplacement]` because `.to.deep.equal()` doesn't work well with function
function convertFunctionToString(nodeSchema) {
  if (typeof nodeSchema === 'function') {
    return '[FunctionReplacement]';
  } else if (!nodeSchema || typeof nodeSchema !== 'object') {
    return nodeSchema;
  } else {
    const schema = {};

    Object.keys(nodeSchema).forEach((name) => {
      const property = nodeSchema[name];

      if (typeof property === 'function') {
        schema[name] = '[FunctionReplacement]';
      } else {
        schema[name] = convertFunctionToString(property, toString)
      }
    });

    return schema;
  }
}
