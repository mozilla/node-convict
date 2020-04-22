/**
 * convict-format-with-validator
 * Format 'email', 'ipaddress' and 'url' for convict
 */
'use strict'

const isEmail = require('validator/lib/isEmail')
const isURL = require('validator/lib/isURL')
const isIP = require('validator/lib/isIP')

function assert(assertion, err_msg) {
  if (!assertion) {
    throw new Error(err_msg)
  }
}

const email = {
  name: 'email',
  coerce: (v) => v.toString(),
  validate: function(x) {
    assert(isEmail(x), 'must be an email address')
  }
}

const ipaddress = {
  name: 'ipaddress',
  coerce: (v) => v.toString(),
  validate: function(x) {
    assert(isIP(x), 'must be an IP address')
  }
}

const url = {
  name: 'url',
  coerce: (v) => v.toString(),
  validate: function(x) {
    assert(isURL(x, {require_tld: false}), 'must be a URL')
  }
}

module.exports = {
  email: email,
  ipaddress: ipaddress,
  url: url
}
