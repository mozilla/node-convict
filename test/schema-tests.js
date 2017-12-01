'use strict';

const path = require('path');
require('must');

describe('convict schema', function() {
  const convict = require('../');
  let conf;
  let conf2 = convict({
    foo: {
      none: {
        format: String,
        default: undefined
      }
    }
  });

  it('must parse a config specification from a file', function() {
    conf = convict(path.join(__dirname, 'schema.json'));
  });

  it('must parse a specification with built-in formats', function() {
    conf = convict(path.join(__dirname, 'cases/schema-built-in-formats.json'));
  });

  it('must throw when parsing a specification that reuses a command-line argument', function() {
    (function() { convict({
      foo: {default: 'a', arg: 'BAZ'},
      bar: {default: 'a', arg: 'BAZ'}
    })}).must.throw();
  });

  describe('after being parsed', function() {

    beforeEach(function() {
      conf = convict(path.join(__dirname, 'schema.json'));
    });

    it('must be valid', function() {
      (function() { conf.validate(); }).must.not.throw();
    });

    it('must be valid again', function() {
      (function() { conf2.validate(); }).must.not.throw();
    });

    it('must export all its properties as JSON', function() {
      let res = conf.getProperties();
      res.must.eql({
        'foo': {
          'bar': 7,
          'baz': {
            'bing': 'foo',
            'name with spaces': {
              'name_with_underscores': true
            }
          }
        }
      });
    });

    it('must export all its properties as a string', function() {
      let res = conf.toString();
      res.must.eql(JSON.stringify({
        'foo': {
          'bar': 7,
          'baz': {
            'bing': 'foo',
            'name with spaces': {
              'name_with_underscores': true
            }
          }
        }
      }, null, 2));
    });

    it('must export the schema as JSON', function() {
      let res = conf.getSchema();
      res.must.eql({
        'properties': {
          'foo': {
            'properties': {
              'bar': {
                'default': 7
              },
              'baz': {
                'properties': {
                  'bing': {
                    'default': 'foo'
                  },
                  'name with spaces': {
                    'properties': {
                      'name_with_underscores': {
                        'default': true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
    });

    it('must export the schema as a JSON string', function() {
      let res = conf.getSchemaString();
      res.must.eql(JSON.stringify({
        'properties': {
          'foo': {
            'properties': {
              'bar': {
                'default': 7
              },
              'baz': {
                'properties': {
                  'bing': {
                    'default': 'foo'
                  },
                  'name with spaces': {
                    'properties': {
                      'name_with_underscores': {
                        'default': true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }, null, 2));
    });

    describe('.has()', function() {
      it('must not have undefined properties', function() {
        let val = conf.has('foo.bar.madeup');
        val.must.be(false);
      });

      it('must not have properties specified with a default of undefined', function() {
        let val = conf2.has('foo.none');
        val.must.be(false);
      });
    });

    describe('.get()', function() {
      it('must find a nested value', function() {
        let val = conf.get('foo.bar');
        val.must.be(7);
      });

      it('must handle three levels of nesting', function() {
        conf.get('foo.baz.bing').must.be('foo');
      });

      it('must handle names with spaces and underscores', function() {
        conf.get('foo.baz.name with spaces.name_with_underscores').must.be(true);
      });

      it('must throw if conf doesn\'t exist', function() {
        (function() { conf.get('foo.no'); }).must.throw();
      });
    });

    describe('.default()', function() {
      // Temporarily modify a property while testing default()
      beforeEach(function() { conf.set('foo.bar', 8); });
      afterEach(function() { conf.set('foo.bar', 7); });

      it('must report the default value of a property', function() {
        conf.get('foo.bar').must.be(8); // Modified
        conf.default('foo.bar').must.be(7);
        conf.get('foo.bar').must.be(8);
      });

      it('must throw if key doesn\'t exist', function() {
        (function() { conf.default('foo.no'); }).must.throw();
      });

      describe('when acting on an Object property', function() {
        beforeEach(function() {
          conf = convict(path.join(__dirname, 'cases/schema-built-in-formats.json'));
        });

        it('must report the default value of the property', function() {
          conf.get('someObject').must.eql({});
          conf.default('someObject').must.eql({});
        });

        it('must not be altered by calls to .set()', function() {
          conf.set('someObject.five', 5);
          conf.default('someObject').must.eql({});
          (function() { conf.default('someObject.five'); }).must.throw();
        });

        it('must not be altered by calls to .load()', function() {
          conf.load({someObject: {five: 5}});
          conf.default('someObject').must.eql({});
          (function() { conf.default('someObject.five'); }).must.throw();
        });
      });
    });

    describe('.reset()', function() {
      // Temporarily modify a property while testing default()
      beforeEach(function() { conf.set('foo.bar', 8); });
      afterEach(function() { conf.set('foo.bar', 7); });

      it('must reset the property to its default value', function() {
        conf.get('foo.bar').must.be(8); // Modified
        conf.reset('foo.bar');
        conf.get('foo.bar').must.be(7);
      });

      it('must throw if key doesn\'t exist', function() {
        (function() { conf.reset('foo.no'); }).must.throw();
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
  (function() {
    convict(schema);
    convict(schema);
  }).must.not.throw();
});
