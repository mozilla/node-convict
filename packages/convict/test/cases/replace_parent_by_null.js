'use strict';

exports.conf = {
  first: {
    second: {
      third: {
        four: {
          default: 4,
          format: 'int'
        }
      }
    }
  }
};

exports.data = {
  first: {
    second: {
      third: null
    }
  }
};
