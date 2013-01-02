exports.conf = {
  ip: {
    doc: "The IP Address to bind.",
    default: "127.0.0.1",
    format: 'ipaddress',
    env: "IP_ADDRESS",
  },
  port: {
    default: 0,
    format: 'port',
    env: "PORT",
    doc: "The port to bind."
  }
};
