'use strict';

exports.conf = {
  true: {
    upper: {
      format: Boolean,
      default: null
    },
    lower: {
      format: Boolean,
      default: null
    },
    mixed: {
      format: Boolean,
      default: null
    }
  },
  false: {
    upper: {
      format: Boolean,
      default: null
    },
    lower: {
      format: Boolean,
      default: null
    },
    mixed: {
      format: Boolean,
      default: null
    }
  }
};

exports.data = {
  true: {
    upper: 'TRUE',
    lower: 'true',
    mixed: 'True'
  },
  false: {
    upper: 'FALSE',
    lower: 'false',
    mixed: 'False'
  }
};

