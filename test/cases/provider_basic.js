'use strict';

exports.conf = {
  ip: {
    default: '127.0.0.1',
    format: 'ipaddress',
    providerPath: 'ip'
  },
  port: {
    default: 0,
    format: 'port',
    providerPath: 'port'
  }
};

exports.provider =
  function(key){
    let out =  {
      'ip': '10.0.1.101',
      'port': '8080'
    }

    return out[key];
  };
