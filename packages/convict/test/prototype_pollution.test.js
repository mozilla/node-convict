'use strict'

const convict = require('../')

describe('Convict prototype pollution resistance', function() {

  test('against __proto__', function() {
    const obj = {}
    const config = convict(obj)

    config.set('__proto__.polluted_proto_root', 'Polluted!')
    expect({}).not.toHaveProperty('polluted_proto_root')

    config.set('__proto__.nested.polluted_proto_nested', 'Polluted!')
    expect({}).not.toHaveProperty('nested')
    expect({}).not.toHaveProperty('nested.polluted_proto_nested')
  })

  test('against this.constructor.prototype', function() {
    const obj = {}
    const config = convict(obj)

    config.set('this.constructor.prototype.polluted_constructor_prototype_root', 'Polluted!')
    expect({}).not.toHaveProperty('polluted_constructor_prototype_root')

    config.set('this.constructor.prototype.nested.polluted_constructor_prototype_nested', 'Polluted!')
    expect({}).not.toHaveProperty('nested')
    expect({}).not.toHaveProperty('nested.polluted_constructor_prototype_nested')
  })

})
