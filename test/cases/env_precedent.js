exports.conf = {
  foo: {
    default: 'a',
    format: String,
    env: 'FOO'
  }
};

exports.env = {
  FOO: 'c'
};
