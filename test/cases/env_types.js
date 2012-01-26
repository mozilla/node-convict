exports.conf = {
  bool: {
    format: 'boolean',
    env: "BOOL"
  },
  int: {
    format: 'integer',
    env: "INT"
  },
  num: {
    format: 'number',
    env: 'NUM'
  }
};

exports.env = {
  BOOL: true,
  INT: 77,
  NUM: 789.1011
};
