'use strict';

module.exports =
  function(key){
    
    let out =  {
      'ip': '10.0.1.101',
      'port': '8080'
    }

    return out[key];
  };
