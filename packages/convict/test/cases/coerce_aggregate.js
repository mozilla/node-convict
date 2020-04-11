'use strict'

exports.conf = {
  nested: {
    data: {
      format: 'map',
      default: {},
      arg: 'data'
    }
  }
}

exports.argv = '--data key=val --data foo=bar'

exports.formats = {
  map: {
    validate: function(value) {
      if (typeof value !== 'object') {
        throw new Error('must be a map of key/value pairs')
      }
    },
    coerce: function(value, config, path) {
      const accum = config.get(path)
      value.split(',').forEach(function(pair) {
        const [k, v] = pair.split('=')
        accum[k] = v
      })
      return accum
    }
  }
}
