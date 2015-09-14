exports.conf = {
  ip: {
    default: '127.0.0.1',
    format: 'ipaddress',
    env: 'IP_ADDRESS'
  },
  port: {
    default: 0,
    format: 'port',
    env: 'PORT'
  }
};

exports.env = {
  IP_ADDRESS: '10.0.1.101',
  PORT: 8080
};
