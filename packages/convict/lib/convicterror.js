'use strict';

/**
  * class parent allows to do:
  * if (myError instanceof CONVICT_ERROR) {
  *   console.log('is convict error');
  * }
 **/
class CONVICT_ERROR extends Error {
  constructor(message) {
    super(message);
    return this;
  }
}


// =========================================
// ============= CONVICT ERROR =============
// =========================================

// new Error = Probably a convict internal error

// =========================================
// ============= INSIDE ERROR ==============
// ============= SCHEMA ERROR ==============
// =========================================
// This is probably a js/application problem.

class SCHEMA_INVALID extends CONVICT_ERROR {
  constructor(fullName, message, value) {
    super(`${fullName}: ${message}`);
    this.fullName = fullName;
    this.value = value;
    this.type = 'SCHEMA_INVALID';
    this.doc = 'You schema is not valid, edit your schema to continue.';
    return this;
  }
}

// =========================================
// ============= INSIDE ERROR ==============
// =============== JS ERROR ================ (with custom getter, format or parser)
// ========================================= or wrong path with get/set/default/reset/getOrigin function.
// This is probably a js/application problem.

class CUSTOMISE_FAILED extends CONVICT_ERROR {
  constructor(message) {
    super(message);
    this.type = 'CUSTOMISE_FAILED';
    this.doc = 'You try to add a getter/format/parser but you failed, fix your javascript code to continue.';
    return this;
  }
}

class INCORRECT_USAGE extends CONVICT_ERROR {
  constructor(message) {
    super(message);
    this.type = 'INCORRECT_USAGE';
    this.doc = 'Incorrect usage of convict function, maybe wrong parameter, fix your javascript code to continue.';
    return this;
  }
}

class PATH_INVALID extends CONVICT_ERROR {
  constructor(fullName, lastPosition, parent) {
    let path = parent.path;
    const state = (() => {
      const type = typeof parent.value;
      if (type !== 'object') {
        return `a ${type}`;
      } else if (parent.value === null) {
        return 'null';
      } else {
        path = lastPosition;
        return 'not defined';
      }
    })();
    const why = `"${path}" is ${state}`;
    super(`${fullName}: cannot find "${lastPosition}" property because ${why}.`);
    this.fullName = fullName;
    this.lastPosition = lastPosition;
    this.why = why;
    this.type = 'PATH_INVALID';
    this.doc = 'To fix this error you should try to use an existing property path (take a look on the schema), edit your javascript file to continue.';
    return this;
  }
}

// =========================================
// ============== USER ERROR ===============
// === (values don't respect the schema) ===
// =========================================
// This is probably a config problem.

class VALUE_INVALID extends CONVICT_ERROR {
  constructor(message) {
    super(message);
    this.type = 'VALUE_INVALID';
    this.doc = 'You should try to change your config to respect the schema to continue.';
    return this;
  }
}

class VALIDATE_FAILED extends CONVICT_ERROR {
  constructor(message) {
    super('Validate failed because wrong value(s):\n' + message);
    this.type = 'VALIDATE_FAILED';
    this.doc = 'You should try to change your config to respect the schema to continue.';
    return this;
  }
}

class FORMAT_INVALID extends CONVICT_ERROR {
  constructor(fullName, message, getter, getterValue, value) {
    super(message);
    this.fullName = fullName;
    this.message = message;
    this.getter = getter;
    this.getterValue = getterValue;
    this.value = value;
    this.type = 'FORMAT_INVALID';
    this.doc = 'You should try to change the property value to respect the schema to continue.';
    return this;
  }
}

module.exports = {
  CONVICT_ERROR,
  // 1
  SCHEMA_INVALID,
  // 2
  CUSTOMISE_FAILED,
  INCORRECT_USAGE,
  PATH_INVALID,
  // 2
  VALUE_INVALID,
  VALIDATE_FAILED,
  FORMAT_INVALID
};
