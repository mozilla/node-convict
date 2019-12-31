'use strict';

const chai = require('chai');
const expect = chai.expect;

const new_require = require('./new_require.js');
const convict = new_require('../');

describe('convict getters', function() {
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
    expect(() => conf.validate()).to.not.throw();
  });

  it('plane can fly', function() {
    expect(conf.get('plane')).to.equal('Yes, you can.');
    expect(conf.getOrigin('plane')).to.equal('answer');
  });

  it('bird cannot swim', function() {
    expect(conf.get('bird')).to.equal('No, you cannot.');
    expect(conf.getOrigin('bird')).to.equal('answer_no');
  });

  it('getter are affraid of ghost !', function() {
    expect(conf.get('ghost')).to.be.undefined;
    expect(conf.getOrigin('ghost')).to.equal('ghost');
  });

  it('must change origin', function() {
    conf.set('bird', 'ok');

    expect(conf.getOrigin('bird')).to.equal('value');
  });

  it('must not rewrite an existing getter', function() {
    const expected = 'The getter property name "answer" is already registered. Set the 4th argument (rewrite) of `addGetter` at true to skip this error.';
    const getter = (value, schema, stopPropagation) => 'Yes, you can.';

    expect(() => convict.addGetter('answer', getter)).to.throw(expected);
  });

  it('must accept only fonction', function() {
    const expected = 'Getter function for "bad" must be a function';
    const str = 'not a function';

    expect(() => convict.addGetter('bad', str)).to.throw(expected);
  });

  it('must not accept getter name: value', function() {
    const expected = 'Getter name use a reservated word: value';

    expect(() => convict.addGetter('value', (v) => v)).to.throw(expected);
  });

  it('must not accept getter name: force', function() {
    const expected = 'Getter name use a reservated word: force';

    expect(() => convict.addGetter('force', (v) => v)).to.throw(expected);
  });

  it('getter with `usedOnlyOnce = true` must not have similar value', function() {
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
    expect(() => convict(schema)).to.throw('bird: uses a already used value in "answer" getter (actual: "Can I fly?")');
  });

  it('must not rewrite an existing getter because I ask to force', function() {
    const getter = (value, schema, stopPropagation) => 'Yes, you can.';
    const usedOnlyOnce = (value, schema, fullName, getterName) => {
      if (value !== 'Can I fly?') {
        throw new Error('Stop asking!');
      }
    };
    expect(() =>
      convict.addGetter('answer', getter, usedOnlyOnce, true)
    ).to.not.throw();
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

  describe('test `conf.refreshGetters()`', function() {
    const convict = new_require('../');
    let conf;

    it('must have the default getters order', function() {
      const order = ['default', 'value', 'env', 'arg', 'force'];
      expect(convict.getGettersOrder()).to.be.deep.equal(order);
    });

    it('must init and parse schema', function() {
      const schema = {
        car: {
          format: 'String',
          default: 'Audi'
        },
        color: {
          format: 'String',
          default: 'green',
          env: 'COLOR'
        },
        city: {
          format: 'String',
          default: 'Paris',
          env: 'CITY'
        },
        food: {
          format: 'String',
          default: 'apple',
          arg: 'FOOD'
        },
        today: {
          format: 'String',
          default: 'no'
        }
      };
      const options = {
        env: {
          'COLOR': 'blue',
          'CITY': 'Okayama'
        },
        args: '--FOOD meat'
      };

      conf = convict(schema, options);

      conf.load({
        today: 'yes',
        unexpected: true
      });

      conf.set('color', 'green', true); // getter: 'force'
      conf.set('city', 'Tokyo'); // getter: 'value'
      conf.set('car', 'Renault', 'env'); // fake getter: 'env'

      conf.validate();
    });

    it('must be deep equal to expected object', function() {
      const table = {
        car: 'env',
        color: 'force',
        city: 'value', // will change because lower level than env.
        today: 'value'
      }

      Object.keys(table).forEach((key) =>
        expect(conf.getOrigin(key)).to.deep.equal(table[key])
      );

      const expectedProperties = {
        'car': 'Renault',
        'color': 'green',
        'city': 'Tokyo',
        'food': 'meat',
        'today': 'yes',
        'unexpected': true
      };

      expect(conf.getProperties()).to.deep.equal(expectedProperties);
    });

    it('must be deep equal to expected object after refresh', function() {
      const expectedProperties = {
        'car': 'Renault',
        'color': 'green',
        'city': 'Okayama',
        'food': 'meat',
        'today': 'yes',
        'unexpected': true
      };

      conf.refreshGetters();

      expect(conf.getProperties()).to.deep.equal(expectedProperties);
    });

  });
});
