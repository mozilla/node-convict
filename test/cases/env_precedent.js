exports.conf = {
  foo: {
    format: 'string = "a"',
    env: "FOO"
  }
};

exports.env = {
  FOO: 'c'
};
