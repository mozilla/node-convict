'use strict';

const path = require('path');
const http = require('http');
const convict = require('../lib/convict.js');

let conf = convict({
  ip: {
    doc: 'The IP Address to bind.',
    format: 'ipaddress',
    default: '127.0.0.1',
    env: 'IP_ADDRESS'
  },
  port: {
    doc: 'The port to bind.',
    format: 'int',
    default: 0,
    env: 'PORT'
  }
}).loadFile(path.join(__dirname, 'config.json')).validate();

let server = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(conf.get('port'), conf.get('ip'), function() {
  let addy = server.address();
  console.log('running on http://%s:%d', addy.address, addy.port); // eslint-disable-line no-console
});
