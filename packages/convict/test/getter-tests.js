'use strict';

const expect = require('must');

describe('convict getters', function() {
  const convict = require('../');
  let conf;

  it('must set custom getters', function() {
    convict.addGetters({
      'answer': {
        getter: (value, schema, stopPropagation) => 'Yes, you can.',
        usedOnlyOnce: true
      }
    });

    convict.addGetter({
      property: 'answer_no',
      getter: (value, schema, stopPropagation) => 'No, you cannot.'
    });

    convict.addGetter({
      property: 'ghost',
      getter: (value, schema, stopPropagation) => {
        stopPropagation();
        return undefined;
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
      },
      ghost: {
        default: 'foo',
        format: (v) => {
          if (typeof v !== 'undefined') {
            throw new Error('not undefined');
          }
        },
        answer: 'Too scared to ask',
        answer_no: 'Too scared to ask',
        ghost: 'ooooh!'
      }
    });

    conf.load({
      default: 'foo',
      plane: 'airbus'
    })
  });

  it('validates conf', function() {
    (function() { conf.validate(); }).must.not.throw();
  });

  it('plane can fly', function() {
    conf.get('plane').must.be('Yes, you can.');
    conf.getOrigin('plane').must.be('answer');
  });

  it('bird cannot swim', function() {
    conf.get('bird').must.be('No, you cannot.');
    conf.getOrigin('bird').must.be('answer_no');
  });

  it('getter are affraid of ghost !', function() {
    expect(conf.get('ghost')).to.be(undefined);
    conf.getOrigin('ghost').must.be('ghost');
  });

  it('must change origin', function() {
    conf.set('bird', 'ok');
    conf.getOrigin('bird').must.be('value');
  });

  it('must not rewrite an existing getter', function() {
    const expected = 'The getter property name "answer" is already registered. Set the 4th argument (rewrite) of `addGetter` at true to skip this error.';
    const getter = (value, schema, stopPropagation) => 'Yes, you can.';

    expect(() => convict.addGetter('answer', getter)).to.throw(expected);
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

  });

  it('must not rewrite an existing getter because I ask to force', function() {

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
