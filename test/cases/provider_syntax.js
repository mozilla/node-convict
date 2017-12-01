'use strict';

exports.conf = {
  foo: {
    bar: {
      default: 'a',
      format: ['a', 'b'],
      providerPath: 'BAR'
    }
  }
};

exports.provider =
  function(key){
    let out = {
      BAR: 'c' // hey!  that's not an allowable value!
    };

    return out[key];
  };
