'use strict';

const expect = require('must');

describe('convict getters', function() {
  const convict = require('../');
  let conf;

  it('must have the default getters order', function() {
    const order = ['default', 'value', 'env', 'arg', 'force'];
    expect(convict.getGettersOrder()).to.be.deep.equal(order);
  });

  it('must init and set custom getters', function() {
    convict.addGetter({
      property: 'ghost',
      getter: (value, schema, stopPropagation) => {
        stopPropagation();
        return undefined;
      }
    });

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
  });

  it('must parse a schema with custom getters', function() {
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
  });

  it('must failed because custom getter order', function() {
    conf.load({
      default: 'foo',
      plane: 'airbus'
    });
    expect(() => conf.validate()).to.throw('ghost: not undefined: value was "No, you cannot.", getter was `answer_no="Too scared to ask"`');
  });

  const wrongOrder = ['default', 'value', 'env', 'arg', 'ghost', 'answer', 'answer_no', 'force'];
  const perfectOrder = ['default', 'value', 'env', 'arg', 'answer', 'answer_no', 'ghost', 'force'];

  it('must throw with an incorrect getter order', function() {
    expect(() => convict.sortGetters('bad')).to.throw('Invalid argument: newOrder must be an array.');
    expect(() => convict.sortGetters(['default', 'value', 'force', 'env'])).to.throw('Invalid order: force cannot be sorted');
    expect(() => convict.sortGetters(['default', 'env'])).to.throw('Invalid order: several getters are missed: value, arg, ghost, answer, answer_no');
    const wrongOrder = ['default', 'value', 'env', 'arg', 'ghost', 'answer', 'answer_no', 'charlie'];
    expect(() => convict.sortGetters(wrongOrder)).to.throw('Invalid order: unknown getter: charlie');
  });

  it('must change the current order', function() {
    expect(convict.getGettersOrder()).to.be.deep.equal(wrongOrder);
    convict.sortGetters(perfectOrder);
    expect(convict.getGettersOrder()).to.be.deep.equal(perfectOrder);
    expect(conf.getGettersOrder()).to.be.deep.equal(wrongOrder);

    const testOrder = ['default', 'value', 'arg', 'env', 'ghost', 'answer', 'answer_no', 'force'];
    conf.sortGetters(testOrder);

    expect(conf.getGettersOrder()).to.be.deep.equal(testOrder);
    expect(convict.getGettersOrder()).to.be.deep.equal(perfectOrder);
  });

  it('must failed because custom getter order', function() {
    conf.load({
      default: 'foo',
      plane: 'airbus'
    });
    expect(() => conf.validate()).to.throw('ghost: not undefined: value was "No, you cannot.", getter was `answer_no="Too scared to ask"`');
  });

  it('must refresh getters and cached values', function() {
    expect(() => conf.refreshGetters()).to.not.throw();
  });

  it('must load with custom getters', function() {
    conf.load({
      default: 'foo',
      plane: 'airbus'
    });
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

  it('can ask "Can I fly?" several time', function() {
    const schema = {
      plane: {
        default: 'foo',
        answer: 'Can I fly?'
      },
      bird: {
        default: 'foo',
        answer: 'Can I fly?'
      }
    };

    expect(() => convict(schema)).to.not.throw();
  });

  it('cannot ask "Can I leave?" several time', function() {
    const schema = {
      plane: {
        default: 'foo',
        answer: 'Can I leave?'
      },
      bird: {
        default: 'foo',
        answer: 'Can I leave?'
      }
    };

    expect(() => convict(schema)).to.throw('Stop asking!');
  });
});
