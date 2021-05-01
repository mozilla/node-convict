'use strict'

exports.conf = {
  foo: {
    default: null,
    format: ['hello', 'world'],
    nullable: true,
  },
  bar: {
    default: null,
    format: String,
    nullable: true,
  }
}
