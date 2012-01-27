const
convict = require('../lib/convict.js'),
http = require('http');

conf = convict({
  ip: {
    doc: "The IP Address to bind.",
    format: 'string = "127.0.0.1"',
    env: "IP_ADDRESS",
  },
  port: {
    format: 'integer = 0',
    env: "PORT",
    doc: "The port to bind."
  }
}).loadFile(__dirname + '/config.json').validate();

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(conf.get('port'), conf.get('ip'), function(x) {
  var addy = server.address();
  console.log('running on http://' + addy.address + ":" + addy.port);
});
