'use strict';

exports.formats = require('convict-format-with-validator');

exports.conf = {
  ip: {
    default: '127.0.0.1',
    format: 'ipaddress',
    arg: 'ip-address'
  }
};
