exports.conf = {
  bool: {
    default: true,
    format: Boolean,
    env: 'BOOL'
  },
  int: {
    default: 42,
    format: 'int',
    env: 'INT'
  },
  nat: {
    default: 333,
    format: 'nat',
    env: 'NAT'
  },
  num: {
    default: 10.1,
    format: Number,
    env: 'NUM'
  },
  array: {
    default: ['a', 'b'],
    format: Array,
    env: 'ARRAY'
  },
  object: {
    format: Object,
    default: {},
    env: 'OBJECT'
  }
};

exports.env = {
  BOOL: true,
  INT: 77,
  NAT: 666,
  NUM: 789.1011,
  ARRAY: 'a,b,c',
  OBJECT: '{"foo": "bar"}'
};
