exports.conf = {
  foo: {
    bar: {
      default: 'a',
      format: ['a', 'b'],
      env: 'BAR'
    }
  }
};

exports.env = {
  BAR: 'c' // hey!  that's not an allowable value!
};
