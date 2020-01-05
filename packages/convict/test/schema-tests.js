'use strict';

const chai = require('chai');
const expect = chai.expect;

const path = require('path');
const new_require = require('./new_require.js');
const convict = new_require('../');

describe('convict schema', function() {
  let myOwnConf; // init in beforeEach
  const conf2 = convict({
    foo: {
      none: {
        format: String,
        default: undefined
      }
    }
  });

  it('must parse a config specification from a file', function() {
    const filepath = path.join(__dirname, 'schema.json');

    expect(() => convict(filepath)).to.not.throw();
  });

  it('must parse a specification with built-in formats', function() {
    const filepath = path.join(__dirname, 'cases/schema-built-in-formats.json');

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

  it('conf2 must be valid', function() {
    expect(() => conf2.validate()).to.not.throw();
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

    it('conf2 must be valid again', function() {
      expect(() => conf2.validate()).to.not.throw();
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
      '_cvtProperties': {
        'foo': {
          '_cvtProperties': {
            'bar': {
              'default': 7,
              'format': 'number'
            },
            'baz': {
              '_cvtProperties': {
                'bing': {
                  'default': 'foo',
                  'format': 'string'
                },
                'name with spaces': {
                  '_cvtProperties': {
                    'name_with_underscores': {
                      'default': true,
                      'format': 'boolean'
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

    it('must export the schema as a JSON string', function() {
      const expected = JSON.stringify(expectedSchema, null, 2);

      expect(myOwnConf.getSchemaString()).to.deep.equal(expected);
    });

    describe('.has()', function() {
      it('must not have undefined properties', function() {
        expect(myOwnConf.has('foo.bar.madeup')).to.be.false;
      });

      it('must not have properties specified with a default of undefined', function() {
        expect(conf2.has('foo.none')).to.be.false;
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
        expect(() => myOwnConf.get('foo.no')).to.throw('cannot find configuration param: foo.no');
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
        expect(() => myOwnConf.default('foo.no')).to.throw('cannot find configuration param: foo._cvtProperties.no.default');
      });

      describe('when acting on an Object property', function() {
        // >> init myOwnConf before each it
        beforeEach(function() {
          myOwnConf = convict(path.join(__dirname, 'cases/schema-built-in-formats.json'));
        });
        // <<

        it('must report the default value of the property', function() {
          expect(myOwnConf.get('someObject')).to.deep.equal({});
          expect(myOwnConf.default('someObject')).to.deep.equal({});
        });

        it('must not be altered by calls to .set()', function() {
          myOwnConf.set('someObject.five', 5);

          expect(myOwnConf.default('someObject')).to.deep.equal({});
          expect(() => myOwnConf.default('someObject.five')).to.throw('cannot find configuration param: someObject._cvtProperties.five.default');
        });

        it('must not be altered by calls to .load()', function() {
          myOwnConf.load({someObject: {five: 5}});

          expect(myOwnConf.default('someObject')).to.deep.equal({});
          expect(() => myOwnConf.default('someObject.five')).to.throw('cannot find configuration param: someObject._cvtProperties.five.default');
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

        myOwnConf.reset('foo.bar');

        expect(myOwnConf.get('foo.bar')).to.equal(7);
      });

      it('must throw if key doesn\'t exist', function() {
        expect(() => myOwnConf.reset('foo.no')).to.throw('cannot find configuration param: foo._cvtProperties.no.default');
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
