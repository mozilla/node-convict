'use strict'

// an example provider

module.exports =
  function(providerPath){
    let out =  {
      'message': 'Hello world!'
    }

    return out[providerPath];
  };
