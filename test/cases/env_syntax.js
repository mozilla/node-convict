exports.conf = {
  foo: {
    bar: {
      format: 'string ["a", "b"]',
      env: "BAR"
    }
  }
};

exports.env = {
  BAR: 'c' // hey!  that's not an allowable value!
};
