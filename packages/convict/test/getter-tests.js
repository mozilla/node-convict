'use strict';

require('must');

describe('convict getters', function() {
  const convict = require('../');
  let conf;

  it('must set custom getters', function() {
    convict.addGetter({
      property: 'answer_no',
      getter: (value, schema, stopPropagation) => 'No, you cannot.'
    });

    convict.addGetters({
      'answer': {
        getter: (value, schema, stopPropagation) => 'Yes, you can.',
        usedOnlyOnce: true
      }
    });

    conf = convict({
      plane: {
        default: 'foo',
        answer: 'Can I fly?'
      },
      bird: {
        default: 'foo',
        answer: 'Can I swim?',
        answer_no: 'Can I swim?'
      }
    });

    conf.load({
      plane: 'airbus'
    })
  });

  it('validates conf', function() {
    (function() { conf.validate(); }).must.not.throw();
  });

  it('must be equals to getter value', function() {
    it('plane can fly', function() {
      conf.get('plane').must.be('Yes, you can.');
    });
    it('bird cannot swim', function() {
      conf.get('bird').must.be('No, you cannot.');
    });
  });

  it('must not rewrite an existing getter', function() {
    (function() {
      convict.addGetter('answer', (value, schema, stopPropagation) => 'Yes, you can.');
    }).must.throw('The getter property name "answer" is already registered. Set the 4th arguments (rewrite) of `addGetter` at true to skip this error.');
  });

  it('must accept only fonction', function() {
    (function() {
      convict.addGetter('bad', 'not a function');
    }).must.throw('Getter function for "bad" must be a function.');
  });

  it('must not accept getter name: value', function() {
    (function() {
      convict.addGetter('value', (v) => v);
    }).must.throw('Getter name use a reservated word: value');
  });

  it('must not accept getter name: force', function() {
    (function() {
      convict.addGetter('force', (v) => v);
    }).must.throw('Getter name use a reservated word: force');
  });

  it('getter with `usedOnlyOnce = true` must not have similar value', function() {
    (function() {
      conf = convict({
        plane: {
          default: 'foo',
          answer: 'Can I fly?'
        },
        bird: {
          default: 'foo',
          answer: 'Can I fly?'
        }
      });
    }).must.throw("'bird' use the same getter value for 'answer': Can I fly?");
  });

  it('must not rewrite an existing getter because I ask to force', function() {
    (function() {
      const fct = (value, schema, fullName, getterName) => {
        if (value !== 'Can I fly?') {
          throw new Error('Stop asking!');
        }
      };
      convict.addGetter('answer', (value, schema, stopPropagation) => 'Yes, you can.', fct, true);
    }).must.not.throw();
  });

  it('I can ask "Can I fly?" several time', function() {
    (function() {
      conf = convict({
        plane: {
          default: 'foo',
          answer: 'Can I fly?'
        },
        bird: {
          default: 'foo',
          answer: 'Can I fly?'
        }
      });
    }).must.not.throw();
  });

  it('I cannot ask "Can I leave?" several time', function() {
    (function() {
      conf = convict({
        plane: {
          default: 'foo',
          answer: 'Can I leave?'
        },
        bird: {
          default: 'foo',
          answer: 'Can I leave?'
        }
      });
    }).must.throw('Stop asking!');
  });
});
