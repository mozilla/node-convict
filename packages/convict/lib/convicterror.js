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
// ============= PARSING ERROR =============
// =========================================
// This is probably a problem with an unexpected usage.

class PARSING_ERROR extends CONVICT_ERROR {
  constructor(message) {
    super(message);
    this.type = 'PARSING_ERROR';
    this.doc = 'This error is unexpected during the parsing/reading, you try todo something that convict not support (in your schema or params).';
    return this;
  }
}

// =========================================
// ============= INSIDE ERROR ==============
// ============= SCHEMA ERROR ==============
// =========================================
// This is probably a js/application problem.

class SCHEMA_INVALID extends CONVICT_ERROR {
  constructor(fullName, message, value) {
    super(`${fullName}: ${message} (actual: ${JSON.stringify(value)})`);
    this.fullName = fullName;
    this.value = value;
    this.type = 'SCHEMA_INVALID';
    this.doc = 'You schema is not valid, edit your schema to continue.';
    return this;
  }
}

// =========================================
// ============= INSIDE ERROR ==============
// =============== JS ERROR ================ (with custom format or parser)
// ========================================= or wrong path with get/set/defaut/reset/getOrigin function.
// This is probably a js/application problem.

class CUSTOMISE_FAILED extends CONVICT_ERROR {
  constructor(message) {
    super(message);
    this.type = 'CUSTOMISE_FAILED';
    this.doc = 'You try to add/modify a format/parser but you failed, fix your javascript code to continue.';
    return this;
  }
}

class PATH_INVALID extends CONVICT_ERROR {
  constructor(message) {
    super(message);
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

class FORMAT_INVALID extends CONVICT_ERROR {
  constructor(fullName, message, value) {
    super(message);

    this.fullName = fullName;
    this.message = message;
    this.value = value;
    this.type = 'FORMAT_INVALID';
    this.doc = 'You should try to change the property value to respect the schema to continue.';
    return this;
  }
}

module.exports = {
  // 1
  CONVICT_ERROR: CONVICT_ERROR,
  PARSING_ERROR: PARSING_ERROR,
  // 2
  SCHEMA_INVALID: SCHEMA_INVALID,
  CUSTOMISE_FAILED: CUSTOMISE_FAILED,
  PATH_INVALID: PATH_INVALID,
  // 3
  VALUE_INVALID: VALUE_INVALID,
  FORMAT_INVALID: FORMAT_INVALID
};
