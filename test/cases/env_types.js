exports.conf = {
  bool: {
    default: true,
    format: Boolean,
    env: "BOOL"
  },
  int: {
    default: 42,
    format: 'int',
    env: "INT"
  },
  num: {
    default: 10.1,
    format: Number,
    env: 'NUM'
  }
};

exports.env = {
  BOOL: true,
  INT: 77,
  NUM: 789.1011
};
