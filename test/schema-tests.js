require('must');

describe('convict schema file', function() {
  const convict = require('../');
  var conf;
  var conf2 = convict({
    foo: {
      none: {
        format: String,
        default: undefined
      }
    }
  });

  it('must parse a config specification from a file', function() {
    conf = convict(__dirname + '/schema.json');
  });

  it('must be valid', function() {
    (function() { conf.validate(); }).must.not.throw();
  });

  it('must be valid again', function() {
    (function() { conf2.validate(); }).must.not.throw();
  });

  it('must export all its properties as JSON', function() {
    var res = conf.getProperties();
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

  it('must export all its properties as JSON (deprecated method)', function() {
    var res = conf.root();
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
    var res = conf.toString();
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
    var res = conf.getSchema();
    res.must.eql({
      'properties': {
        'foo': {
          'properties': {
            'bar': {},
            'baz': {
              'properties': {
                'bing': {},
                'name with spaces': {
                  'properties': {
                    'name_with_underscores': {}
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
    var res = conf.getSchemaString();
    res.must.eql(JSON.stringify({
      'properties': {
        'foo': {
          'properties': {
            'bar': {},
            'baz': {
              'properties': {
                'bing': {},
                'name with spaces': {
                  'properties': {
                    'name_with_underscores': {}
                  }
                }
              }
            }
          }
        }
      }
    }, null, 2));
  });

  it('must export the schema as a JSON string (deprecated method)', function() {
    var res = conf.toSchemaString();
    res.must.eql(JSON.stringify({
      'properties': {
        'foo': {
          'properties': {
            'bar': {},
            'baz': {
              'properties': {
                'bing': {},
                'name with spaces': {
                  'properties': {
                    'name_with_underscores': {}
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
      var val = conf.has('foo.bar.madeup');
      val.must.be(false);
    });

    it('must not have properties specified with a default of undefined', function() {
      var val = conf2.has('foo.none');
      val.must.be(false);
    });
  });

  describe('.get()', function() {
    it('must find a nested value', function() {
      var val = conf.get('foo.bar');
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
    before(function() { conf.set('foo.bar', 8); });
    after(function() { conf.set('foo.bar', 7); });

    it('must report the default value of a property', function() {
      conf.get('foo.bar').must.be(8); // Modified
      conf.default('foo.bar').must.be(7);
    });

    it('must throw if key doesn\'t exist', function() {
      (function() { conf.default('foo.no'); }).must.throw();
    });
  });
});

describe('convict used multiple times on one schema', function() {
  const convict = require('../');
  var schema = {
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
