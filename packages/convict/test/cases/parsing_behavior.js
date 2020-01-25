'use strict';

exports.conf = {
  // default
  zoo: {
    elephant: {
      doc: 'Elephant name',
      format: 'Array'
    },
    format: {
      // magic parsing
      bird: 'everywhere'
    }
  },
  none: {
    format: '*',
    default: undefined
  }
};

exports.data = {
  zoo: {
    elephant: ['Patrick', 'Bob', 'Carlo']
  },
  none: 8
};
