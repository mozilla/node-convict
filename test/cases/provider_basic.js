'use strict';

exports.conf = {
  ip: {
    default: '127.0.0.1',
    format: 'ipaddress',
    provider: 'IP_ADDRESS'
  },
  port: {
    default: 0,
    format: 'port',
    provider: 'PORT'
  }
};

exports.provider = {
  IP_ADDRESS: '10.0.1.101',
  PORT: 8080
};
