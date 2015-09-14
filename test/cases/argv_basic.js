exports.conf = {
  ip: {
    default: '127.0.0.1',
    format: 'ipaddress',
    arg: 'ip-address'
  },
  port: {
    default: 0,
    format: 'port',
    arg: 'port'
  }
};

exports.argv = '--ip-address 10.0.1.101 --port 8080';
