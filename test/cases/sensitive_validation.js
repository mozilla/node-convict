'use strict';

exports.conf = {
  public: {
    format: 'nat',
    default: -1,
    doc: 'A public value'
  },
  private: {
    format: 'nat',
    default: -1,
    doc: 'A sensitive value',
    sensitive: true
  }
};
