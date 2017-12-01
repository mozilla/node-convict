'use strict';

exports.conf = {
  foo: {
    default: 'a',
    format: String,
    providerPath: 'FOO'
  }
};


exports.provider =
  function(key){
    let out = {
      FOO: 'c'
    };
    
    return out[key];
  };

