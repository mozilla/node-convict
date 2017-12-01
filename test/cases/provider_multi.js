'use strict';

exports.conf = {
  foo: {
    default: 'a',
    format: String,
    providerPath: 'FOO'
  },
  bar: {
    default: 'a',
    format: String,
    providerPath: 'FOO'
  },
};

exports.provider =
  function(key){
    let out =   {
      FOO: 'b'
    };
    

    return out[key];
  };