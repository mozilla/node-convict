exports.conf = {
  ip: {
    format: 'string = "127.0.0.1"',
    env: "IP_ADDRESS"
  },
  port: {
    format: 'integer = 0',
    env: "PORT"
  }
};

exports.env = {
  IP_ADDRESS: '10.0.1.101',
  PORT: 8080
};
