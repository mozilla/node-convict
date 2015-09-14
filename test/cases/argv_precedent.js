exports.conf = {
  foo: {
    default: 'a',
    format: String,
    env: 'FOO',
    arg: 'foo'
  }
};

exports.env = {
  FOO: 'c'
};

exports.argv = '--foo d';
