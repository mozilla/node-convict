exports.conf = {
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
};
