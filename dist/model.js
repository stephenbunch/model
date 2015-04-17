(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.model = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * @param {Model} view
 * @param {String} key
 * @param {ModelSchema} schema
 */
exports['default'] = Collection;

var _bind$findIndex = require('./util');

function Collection(parent, key, schema) {
  this.$parent = parent;
  this.$key = key;
  this.$schema = schema;

  this.$parent.$view.watch(this.$key, _bind$findIndex.bind(this._didChange, this));
  this._didChange();
}

Collection.prototype = Object.create(Array.prototype);
Collection.prototype.constructor = Collection;

Collection.prototype.add = function (item) {
  if (this.indexOf(item) === -1) {
    this.remove(item);
    item = this.$schema.cast(item);
    this.push(item);
    this._apply();
  }
  return item;
};

Collection.prototype.remove = function (item) {
  var index = this.indexOf(item);
  if (index === -1) {
    index = _bind$findIndex.findIndex(this, function (model) {
      return model.equals(item);
    });
  }
  if (index > -1) {
    this.splice(index, 1);
    this._apply();
  }
};

Collection.prototype['new'] = function (defaults) {
  return this.$schema['new'](defaults);
};

Collection.prototype.addNew = function (defaults) {
  return this.add(this['new'](defaults));
};

Collection.prototype.clear = function () {
  this.length = 0;
  this._apply();
};

Collection.prototype.toJSON = function () {
  return this.map(function (item) {
    return item.toJSON();
  });
};

Collection.prototype._didChange = function () {
  var self = this;
  if (!this._updating) {
    this.length = 0;
    (this.$parent.$view.get(this.$key) || []).forEach(function (item) {
      self.push(self.$schema.cast(item));
    });
  }
};

Collection.prototype._apply = function () {
  this._updating = true;
  this.$parent.$view.set(this.$key, this.map(function (item) {
    return item.$view;
  }));
  this._updating = false;
};
module.exports = exports['default'];

},{"./util":13}],2:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = CollectionSchema;

var _typeOf = require('./util');

var _ValidationError = require('./ValidationError');

var _ValidationError2 = _interopRequireWildcard(_ValidationError);

function CollectionSchema(type) {
  if (!(this instanceof CollectionSchema)) {
    return new CollectionSchema(type);
  }

  this.type = type;
}

CollectionSchema.prototype.cast = function (value) {
  if (value === undefined) {
    value = null;
  }
  if (_typeOf.typeOf(value) === 'array') {
    var type = this.type;
    return value.map(function (item) {
      return type.cast(item);
    });
  } else {
    return [];
  }
};

CollectionSchema.prototype.validate = function (value) {
  if (_typeOf.typeOf(value) !== 'array') {
    throw new _ValidationError2['default']('Value must be an array.');
  }
  var type = this.type;
  value.forEach(function (item, index) {
    try {
      type.validate(item);
    } catch (err) {
      throw new _ValidationError2['default']('The item at index ' + index + ' is invalid.', err);
    }
  });
};
module.exports = exports['default'];

},{"./ValidationError":9,"./util":13}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @param {ModelSchema} schema
 * @param {View} view
 */
exports["default"] = Model;

function Model(schema, view) {
  this.$schema = schema;
  this.$view = view;
}

Model.prototype.edit = function () {
  return this.$schema.cast(this.$view.fork());
};

Model.prototype.commit = function () {
  this.$view.commit();
};

Model.prototype.reset = function () {
  this.$view.reset();
};

Model.prototype.toJSON = function () {
  return this.$view.toJSON();
};

Model.prototype.equals = function (other) {
  return other === this;
};
module.exports = exports["default"];

},{}],4:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = ModelSchema;

var _cloneDeep = require('./util');

var _Model = require('./Model');

var _Model2 = _interopRequireWildcard(_Model);

var _View = require('./View');

var _View2 = _interopRequireWildcard(_View);

var _CollectionSchema = require('./CollectionSchema');

var _CollectionSchema2 = _interopRequireWildcard(_CollectionSchema);

var _Collection = require('./Collection');

var _Collection2 = _interopRequireWildcard(_Collection);

var _pathy = (window.pathy);

var _pathy2 = _interopRequireWildcard(_pathy);

function ModelSchema(paths, options) {
  this.paths = paths;
  this.options = options || {};

  this.members = this.options.members || {};
  delete this.options.members;

  if (this.members.init) {
    this.initializer = this.members.init;
    delete this.members.init;
  }
}

ModelSchema.prototype['new'] = function (defaults) {
  return this.cast(_cloneDeep.cloneDeep(defaults || {}));
};

ModelSchema.prototype.cast = function (value) {
  if (value === undefined || value === null) {
    return null;
  }
  var view;
  if (value instanceof _Model2['default']) {
    if (value.$schema === this) {
      return value;
    }
    view = value.$view;
  } else if (value instanceof _View2['default']) {
    view = value;
  } else {
    if (value.toJSON) {
      value = value.toJSON();
    }
    view = new _View2['default']();
    view.merge(value);
  }
  var model = new _Model2['default'](this, view);
  this.addPaths(model);
  this.addMembers(model);
  if (this.initializer) {
    this.initializer.call(model);
  }
  return model;
};

/**
 * @param {Model} model
 */
ModelSchema.prototype.addPaths = function (model) {
  var self = this;
  this.paths.forEach(function (path) {
    if (path.type.type instanceof _CollectionSchema2['default'] && path.type.type.type.type instanceof ModelSchema) {
      self.addCollectionPath(model, path);
    } else {
      self.addAttributePath(model, path);
    }
  });
};

/**
 * @param {Model} model
 * @param {SchemaPath} path
 */
ModelSchema.prototype.addCollectionPath = function (model, path) {
  var collection = new _Collection2['default'](model, path.name, path.type.type.type.type);
  _pathy2['default'](path.name).override(model, {
    get: function get() {
      return collection;
    }
  });
};

/**
 * @param {Model} model
 * @param {SchemaPath} path
 */
ModelSchema.prototype.addAttributePath = function (model, path) {
  _pathy2['default'](path.name).override(model, {
    initialize: false,
    get: function get() {
      return path.type.cast(model.$view.get(path.name));
    },
    set: function set(value) {
      model.$view.set(path.name, path.type.cast(value));
    }
  });
};

/**
 * @param {Model} model
 */
ModelSchema.prototype.addMembers = function (model) {
  var self = this;
  Object.keys(this.members).forEach(function (key) {
    var member = self.members[key];
    var descriptor = {};

    if (typeof member === 'function') {
      self.addFunctionMember(model, member, key);
    } else if (!!member && typeof member === 'object') {
      self.addPropertyMember(model, member, key);
    }
  });
};

/**
 * @param {Model} model
 * @param {Function} func
 * @param {String} key
 */
ModelSchema.prototype.addFunctionMember = function (model, func, key) {
  func = bind(func, model);
  _pathy2['default'](key).override(model, {
    get: function get() {
      return func;
    }
  });
};

/**
 * @param {Model} model
 * @param {Object} accessors
 * @param {String} key
 */
ModelSchema.prototype.addPropertyMember = function (model, accessors, key) {
  var descriptor = {};
  if (typeof accessors.get === 'function') {
    descriptor.get = bind(accessors.get, model);
  }
  if (typeof accessors.set === 'function') {
    descriptor.set = bind(accessors.set, model);
  }
  if (Object.keys(descriptor).length > 0) {
    descriptor.initialize = false;
    _pathy2['default'](key).override(model, descriptor);
  }
};
module.exports = exports['default'];

},{"./Collection":1,"./CollectionSchema":2,"./Model":3,"./View":11,"./util":13}],5:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = ObjectSchema;

var _ValidationError = require('./ValidationError');

var _ValidationError2 = _interopRequireWildcard(_ValidationError);

function ObjectSchema(paths) {
  if (!(this instanceof ObjectSchema)) {
    return new ObjectSchema(paths);
  }

  this.paths = paths;
}

ObjectSchema.prototype.cast = function (value) {
  if (value === undefined) {
    value = null;
  }
  return this.paths.reduce(function (object, path) {
    path.set(object, path.type.cast(path.get(value)));
    return object;
  }, {});
};

ObjectSchema.prototype.validate = function (value) {
  this.paths.forEach(function (path) {
    try {
      path.type.validate(path.get(value));
    } catch (err) {
      throw new _ValidationError2['default']('The value at ' + path.name + ' is invalid.');
    }
  });
};
module.exports = exports['default'];

},{"./ValidationError":9}],6:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = SchemaParser;

var _ObjectSchema = require('./ObjectSchema');

var _ObjectSchema2 = _interopRequireWildcard(_ObjectSchema);

var _CollectionSchema = require('./CollectionSchema');

var _CollectionSchema2 = _interopRequireWildcard(_CollectionSchema);

var _ValueSchema$Any = require('./ValueSchema');

var _ValueSchema$Any2 = _interopRequireWildcard(_ValueSchema$Any);

var _SchemaPath = require('./SchemaPath');

var _SchemaPath2 = _interopRequireWildcard(_SchemaPath);

var _cloneDeep$typeOf = require('./util');

function SchemaParser() {
  if (!(this instanceof SchemaParser)) {
    return new SchemaParser();
  }

  this.objectFactory = _ObjectSchema2['default'];
  this.collectionFactory = _CollectionSchema2['default'];
  this.valueFactory = _ValueSchema$Any2['default'];
  this.pathFactory = _SchemaPath2['default'];

  this.typeMatchers = [];
  this.typeMatchers.push(function (node) {
    return node instanceof _ObjectSchema2['default'];
  });
}

SchemaParser.prototype.parse = function (node) {
  if (this.isValueNode(node)) {
    return this.valueFromNode(node);
  } else {
    return this.objectFactory(this.pathsFromNode('', node));
  }
};

/**
 * @param {String} base
 * @param {*} node
 * @returns {Array.<SchemaPath>}
 */
SchemaParser.prototype.pathsFromNode = function (base, node) {
  if (node === undefined) {
    return [];
  }
  node = this.valueFromLiteral(node);
  if (this.isValueNode(node)) {
    return [this.pathFactory(base, this.valueFromNode(node))];
  }
  var self = this;
  return Object.keys(node).map(function (key) {
    return self.pathsFromNode(base ? base + '.' + key : key, node[key]);
  }).reduce(function (paths, morePaths) {
    return paths.concat(morePaths);
  }, []);
};

SchemaParser.prototype.valueFromLiteral = function (node) {
  if (node === null) {
    return _ValueSchema$Any.Any;
  }
  return node;
};

SchemaParser.prototype.isTypeNode = function (node) {
  var result = typeof node === 'function' || _cloneDeep$typeOf.typeOf(node) === 'array';
  if (!result) {
    for (var i = 0, len = this.typeMatchers.length; i < len && !result; i++) {
      result = this.typeMatchers[i](node);
    }
  }
  return result;
};

SchemaParser.prototype.isTypeNodeWithOptions = function (node) {
  return typeof node === 'object' && node !== null && this.isTypeNode(node.type);
};

SchemaParser.prototype.optionsFromNode = function (node) {
  var options = _cloneDeep$typeOf.cloneDeep(node);
  delete options.type;
  return options;
};

SchemaParser.prototype.typeFromNode = function (node) {
  if (this.isCollectionType(node)) {
    return this.collectionFromNode(node);
  } else {
    return node;
  }
};

SchemaParser.prototype.isCollectionType = function (value) {
  return value === Array || _cloneDeep$typeOf.typeOf(value) === 'array';
};

SchemaParser.prototype.isValueNode = function (node) {
  return this.isTypeNode(node) || this.isTypeNodeWithOptions(node);
};

SchemaParser.prototype.valueFromNode = function (node) {
  if (this.isTypeNodeWithOptions(node)) {
    return this.valueFactory(this.typeFromNode(node.type), this.optionsFromNode(node));
  } else {
    return this.valueFactory(this.typeFromNode(node));
  }
};

SchemaParser.prototype.collectionFromNode = function (node) {
  if (_cloneDeep$typeOf.typeOf(node) === 'array' && node.length > 0) {
    return this.collectionFactory(this.valueFromNode(node[0]));
  } else {
    return this.collectionFactory(this.valueFactory(_ValueSchema$Any.Any));
  }
};
module.exports = exports['default'];

},{"./CollectionSchema":2,"./ObjectSchema":5,"./SchemaPath":7,"./ValueSchema":10,"./util":13}],7:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = SchemaPath;

var _pathy = (window.pathy);

var _pathy2 = _interopRequireWildcard(_pathy);

function SchemaPath(path, type) {
  if (!(this instanceof SchemaPath)) {
    return new SchemaPath(path, type);
  }

  this.name = path;
  this.type = type;
  this.accessor = _pathy2['default'](path);
}

SchemaPath.prototype.get = function (object) {
  return this.accessor.get(object);
};

SchemaPath.prototype.set = function (object, value) {
  this.accessor.set(object, value);
};
module.exports = exports['default'];

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = SchemaType;

function SchemaType(caster) {
  this.cast = caster;
}

SchemaType.prototype.validate = function () {};
module.exports = exports["default"];

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = ValidationError;

function ValidationError(message, error) {
  this.name = 'ValidationError';
  this.message = message;
  this.error = error || null;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
module.exports = exports['default'];

},{}],10:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Any = Any;

/**
 * @param {SchemaType|Function} type
 * @param {Object} [options]
 */
exports['default'] = ValueSchema;

var _SchemaType = require('./SchemaType');

var _SchemaType2 = _interopRequireWildcard(_SchemaType);

var _ValidationError = require('./ValidationError');

var _ValidationError2 = _interopRequireWildcard(_ValidationError);

function Any(value) {
  return value;
}

function ValueSchema(type, options) {
  if (!(this instanceof ValueSchema)) {
    return new ValueSchema(type, options);
  }

  this.options = options || {};

  if (typeof type === 'function') {
    if (type === Any) {
      this.options.optional = true;
    }
    this.type = new _SchemaType2['default'](type);
  } else {
    this.type = type;
  }

  this.validators = [];
  this.validators.push(function (value) {
    if (value === null || value === undefined) {
      if (this.options.optional) {
        return true;
      } else {
        throw new _ValidationError2['default']('Value cannot be null.');
      }
    }
  });
}

ValueSchema.prototype.cast = function (value) {
  if (value === undefined) {
    value = null;
  }
  if (this.options.optional) {
    if (value === null) {
      return null;
    }
  }
  return this.type.cast(value);
};

ValueSchema.prototype.validate = function (value) {
  for (var i = 0, len = this.validators.length; i < len; i++) {
    if (this.validators[i].call(this, value) === true) {
      return;
    }
  }
  this.type.validate(value);
};

},{"./SchemaType":8,"./ValidationError":9}],11:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = View;

var _pathy = (window.pathy);

var _pathy2 = _interopRequireWildcard(_pathy);

var _merge$cloneDeep = require('./util');

function View(view) {
  this.view = view;
  this._local = {};
  this.reset();
}

View.prototype.get = function (path) {
  var value = _pathy2['default'](path).get(this._local.value);
  if (value === undefined && this.view) {
    return this.view.get(path);
  } else {
    return value;
  }
};

View.prototype.set = function (path, value) {
  _pathy2['default'](path).set(this._local.value, value);
};

View.prototype.reset = function () {
  // We'll store actual value as a sub-property so that observers can listen
  // for changes even if the entire object gets replaced.
  this._local.value = {};
};

View.prototype.merge = function (object) {
  _merge$cloneDeep.merge(this._local.value, object);
};

View.prototype.replace = function (object) {
  this._local.value = object || {};
};

View.prototype.commit = function () {
  if (!this.view) {
    throw new Error('No subview to commit to!');
  }
  this.view.merge(this._local.value);
  this.reset();
};

View.prototype.toJSON = function () {
  return _merge$cloneDeep.merge(_merge$cloneDeep.cloneDeep(this._local.value), this.view && this.view.toJSON() || {});
};

View.prototype.fork = function () {
  return new View(this);
};

View.prototype.watch = function (path, listener) {
  if (this.view) {
    this.view.watch(path, listener);
  }
  _pathy2['default'](path).watch(this._local.value, listener);
};
module.exports = exports['default'];

},{"./util":13}],12:[function(require,module,exports){
'use strict';

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Type = Type;
exports.Schema = Schema;

var _SchemaParser = require('./SchemaParser');

var _SchemaParser2 = _interopRequireWildcard(_SchemaParser);

var _ModelSchema = require('./ModelSchema');

var _ModelSchema2 = _interopRequireWildcard(_ModelSchema);

var _merge$cloneDeep = require('./util');

var basicSchemaParser = new _SchemaParser2['default']();
var modelSchemaParser = new _SchemaParser2['default']();
modelSchemaParser.typeMatchers.push(function (node) {
  return node instanceof _ModelSchema2['default'];
});

function Type(node) {
  return basicSchemaParser.parse(node);
}

function Schema(node, options) {
  return new _ModelSchema2['default'](modelSchemaParser.parse(node).paths, options);
}

var _default = require('./Collection');

exports.Collection = _interopRequire(_default);

var _default2 = require('./CollectionSchema');

exports.CollectionSchema = _interopRequire(_default2);

var _default3 = require('./Model');

exports.Model = _interopRequire(_default3);
exports.ModelSchema = _interopRequire(_ModelSchema);

var _default4 = require('./ObjectSchema');

exports.ObjectSchema = _interopRequire(_default4);
exports.SchemaParser = _interopRequire(_SchemaParser);

var _default5 = require('./SchemaPath');

exports.SchemaPath = _interopRequire(_default5);

var _default6 = require('./ValidationError');

exports.ValidationError = _interopRequire(_default6);

var _default$Any = require('./ValueSchema');

exports.ValueSchema = _interopRequire(_default$Any);
Object.defineProperty(exports, 'Any', {
  enumerable: true,
  get: function get() {
    return _default$Any.Any;
  }
});

var _default7 = require('./View');

exports.View = _interopRequire(_default7);
var util = {
  merge: _merge$cloneDeep.merge,
  cloneDeep: _merge$cloneDeep.cloneDeep
};
exports.util = util;

},{"./Collection":1,"./CollectionSchema":2,"./Model":3,"./ModelSchema":4,"./ObjectSchema":5,"./SchemaParser":6,"./SchemaPath":7,"./ValidationError":9,"./ValueSchema":10,"./View":11,"./util":13}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.cloneDeep = cloneDeep;

/**
 * Merges the remaining parameters into the first parameter.
 * @param {Object|Array} object The destination object.
 * @param {...Object} other The source objects.
 * @returns {Object} Returns object.
 */
exports.merge = merge;

/**
 * Gets the internal JavaScript [[Class]] of an object.
 * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray
 *
 * @private
 * @param {*} value
 * @returns {String}
 */
exports.typeOf = typeOf;
exports.findIndex = findIndex;
exports.find = find;
exports.bind = bind;

function cloneDeep(object) {

  function cloneValue(value) {
    if (typeof value === 'object' && value !== null) {
      if (typeOf(object) === 'array') {
        return cloneArray(array);
      }
      return cloneObject(value);
    }
    return value;
  }

  function cloneObject(object) {
    return Object.keys(object).map(function (key) {
      return {
        key: key,
        value: cloneValue(object[key])
      };
    }).reduce(function (obj, item) {
      obj[item.key] = item.value;
      return obj;
    }, {});
  }

  function cloneArray(array) {
    return array.map(function (item) {
      return cloneValue(item);
    });
  }

  return cloneValue(object);
}

function merge(object, other) {
  if (!object || typeof object !== 'object') {
    return object;
  }

  var stack = [];
  var args = Array.prototype.slice.call(arguments, 1);
  for (var i = 0, len = args.length; i < len; i++) {
    if (!!args[i] && typeof args[i] === 'object') {
      stack.push({
        dest: object,
        src: args[i],
        merge: mergeObjects
      });
    }
  }

  while (stack.length > 0) {
    var context = stack.pop();
    context.merge(context.dest, context.src);
  }

  return object;

  function mergeObjects(a, b) {
    var keys = Object.keys(b);
    for (var i = 0, len = keys.length; i < len; i++) {
      mergeSet(a, keys[i], b[keys[i]]);
    }
  }

  function mergeSet(source, key, bValue) {
    var aValue = source[key];
    // The only times 'b' doesn't go into 'a' is when 'b' is undefined, or
    // both 'a' and 'b' are objects, or when both 'a' and 'b' are arrays.
    if (bValue === undefined) {
      return;
    }
    if (typeof aValue === 'object' && aValue !== null && typeof bValue === 'object' && bValue !== null) {
      stack.push({
        dest: aValue,
        src: bValue,
        merge: mergeObjects
      });
      return;
    }
    source[key] = bValue;
  }
}

function typeOf(value) {
  return Object.prototype.toString.call(value).match(/^\[object\s(.*)\]$/)[1].toLowerCase();
}

function findIndex(array, matcher) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (matcher(array[i])) {
      return i;
    }
  }
  return -1;
}

function find(array, matcher) {
  var index = findIndex(array, matcher);
  if (index > -1) {
    return array[index];
  } else {
    return null;
  }
}

function bind(func, context) {
  var args = Array.prototype.slice.call(arguments, 2);
  return function () {
    return func.apply(context, args.concat(Array.prototype.slice.call(arguments)));
  };
}

},{}]},{},[12])(12)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc3RlcGhlbi9jb2RlL3N0ZXBoZW5idW5jaC9tb2RlbC9zcmMvQ29sbGVjdGlvbi5qcyIsIi9Vc2Vycy9zdGVwaGVuL2NvZGUvc3RlcGhlbmJ1bmNoL21vZGVsL3NyYy9Db2xsZWN0aW9uU2NoZW1hLmpzIiwiL1VzZXJzL3N0ZXBoZW4vY29kZS9zdGVwaGVuYnVuY2gvbW9kZWwvc3JjL01vZGVsLmpzIiwiL1VzZXJzL3N0ZXBoZW4vY29kZS9zdGVwaGVuYnVuY2gvbW9kZWwvc3JjL01vZGVsU2NoZW1hLmpzIiwiL1VzZXJzL3N0ZXBoZW4vY29kZS9zdGVwaGVuYnVuY2gvbW9kZWwvc3JjL09iamVjdFNjaGVtYS5qcyIsIi9Vc2Vycy9zdGVwaGVuL2NvZGUvc3RlcGhlbmJ1bmNoL21vZGVsL3NyYy9TY2hlbWFQYXJzZXIuanMiLCIvVXNlcnMvc3RlcGhlbi9jb2RlL3N0ZXBoZW5idW5jaC9tb2RlbC9zcmMvU2NoZW1hUGF0aC5qcyIsIi9Vc2Vycy9zdGVwaGVuL2NvZGUvc3RlcGhlbmJ1bmNoL21vZGVsL3NyYy9TY2hlbWFUeXBlLmpzIiwiL1VzZXJzL3N0ZXBoZW4vY29kZS9zdGVwaGVuYnVuY2gvbW9kZWwvc3JjL1ZhbGlkYXRpb25FcnJvci5qcyIsIi9Vc2Vycy9zdGVwaGVuL2NvZGUvc3RlcGhlbmJ1bmNoL21vZGVsL3NyYy9WYWx1ZVNjaGVtYS5qcyIsIi9Vc2Vycy9zdGVwaGVuL2NvZGUvc3RlcGhlbmJ1bmNoL21vZGVsL3NyYy9WaWV3LmpzIiwiL1VzZXJzL3N0ZXBoZW4vY29kZS9zdGVwaGVuYnVuY2gvbW9kZWwvc3JjL2luZGV4LmpzIiwiL1VzZXJzL3N0ZXBoZW4vY29kZS9zdGVwaGVuYnVuY2gvbW9kZWwvc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7OztxQkNPd0IsVUFB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QzNCLGFBQU8sQ0FBQyxDQUFDO0tBQ1Y7R0FDRjtBQUNELFNBQU8sQ0FBQyxDQUFDLENBQUM7Q0FDWDs7QUFFTSxTQUFTLElBQUksQ0FBRSxLQUFLLEVBQUUsT0FBTyxFQUFHO0FBQ3JDLE1BQUksS0FBSyxHQUFHLFNBQVMsQ0FBRSxLQUFLLEVBQUUsT0FBTyxDQUFFLENBQUM7QUFDeEMsTUFBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUc7QUFDaEIsV0FBTyxLQUFLLENBQUUsS0FBSyxDQUFFLENBQUM7R0FDdkIsTUFBTTtBQUNMLFdBQU8sSUFBSSxDQUFDO0dBQ2I7Q0FDRjs7QUFFTSxTQUFTLElBQUksQ0FBRSxJQUFJLEVBQUUsT0FBTyxFQUFHO0FBQ3BDLE1BQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBRSxTQUFTLEVBQUUsQ0FBQyxDQUFFLENBQUM7QUFDdEQsU0FBTyxZQUFXO0FBQ2hCLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUUsU0FBUyxDQUFFLENBQUUsQ0FBRSxDQUFDO0dBQ3RGLENBQUM7Q0FDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBiaW5kLCBmaW5kSW5kZXggfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEBwYXJhbSB7TW9kZWx9IHZpZXdcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TW9kZWxTY2hlbWF9IHNjaGVtYVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb2xsZWN0aW9uKCBwYXJlbnQsIGtleSwgc2NoZW1hICkge1xuICB0aGlzLiRwYXJlbnQgPSBwYXJlbnQ7XG4gIHRoaXMuJGtleSA9IGtleTtcbiAgdGhpcy4kc2NoZW1hID0gc2NoZW1hO1xuXG4gIHRoaXMuJHBhcmVudC4kdmlldy53YXRjaCggdGhpcy4ka2V5LCBiaW5kKCB0aGlzLl9kaWRDaGFuZ2UsIHRoaXMgKSApO1xuICB0aGlzLl9kaWRDaGFuZ2UoKTtcbn1cblxuQ29sbGVjdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBBcnJheS5wcm90b3R5cGUgKTtcbkNvbGxlY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29sbGVjdGlvbjtcblxuQ29sbGVjdGlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oIGl0ZW0gKSB7XG4gIGlmICggdGhpcy5pbmRleE9mKCBpdGVtICkgPT09IC0xICkge1xuICAgIHRoaXMucmVtb3ZlKCBpdGVtICk7XG4gICAgaXRlbSA9IHRoaXMuJHNjaGVtYS5jYXN0KCBpdGVtICk7XG4gICAgdGhpcy5wdXNoKCBpdGVtICk7XG4gICAgdGhpcy5fYXBwbHkoKTtcbiAgfVxuICByZXR1cm4gaXRlbTtcbn07XG5cbkNvbGxlY3Rpb24ucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCBpdGVtICkge1xuICB2YXIgaW5kZXggPSB0aGlzLmluZGV4T2YoIGl0ZW0gKTtcbiAgaWYgKCBpbmRleCA9PT0gLTEgKSB7XG4gICAgaW5kZXggPSBmaW5kSW5kZXgoIHRoaXMsIGZ1bmN0aW9uKCBtb2RlbCApIHtcbiAgICAgIHJldHVybiBtb2RlbC5lcXVhbHMoIGl0ZW0gKTtcbiAgICB9KTtcbiAgfVxuICBpZiAoIGluZGV4ID4gLTEgKSB7XG4gICAgdGhpcy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgdGhpcy5fYXBwbHkoKTtcbiAgfVxufTtcblxuQ29sbGVjdGlvbi5wcm90b3R5cGUubmV3ID0gZnVuY3Rpb24oIGRlZmF1bHRzICkge1xuICByZXR1cm4gdGhpcy4kc2NoZW1hLm5ldyggZGVmYXVsdHMgKTtcbn07XG5cbkNvbGxlY3Rpb24ucHJvdG90eXBlLmFkZE5ldyA9IGZ1bmN0aW9uKCBkZWZhdWx0cyApIHtcbiAgcmV0dXJuIHRoaXMuYWRkKCB0aGlzLm5ldyggZGVmYXVsdHMgKSApO1xufTtcblxuQ29sbGVjdGlvbi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5sZW5ndGggPSAwO1xuICB0aGlzLl9hcHBseSgpO1xufTtcblxuQ29sbGVjdGlvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm1hcCggZnVuY3Rpb24oIGl0ZW0gKSB7XG4gICAgcmV0dXJuIGl0ZW0udG9KU09OKCk7XG4gIH0pO1xufTtcblxuQ29sbGVjdGlvbi5wcm90b3R5cGUuX2RpZENoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICggIXRoaXMuX3VwZGF0aW5nICkge1xuICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICAoIHRoaXMuJHBhcmVudC4kdmlldy5nZXQoIHRoaXMuJGtleSApIHx8IFtdICkuZm9yRWFjaCggZnVuY3Rpb24oIGl0ZW0gKSB7XG4gICAgICBzZWxmLnB1c2goIHNlbGYuJHNjaGVtYS5jYXN0KCBpdGVtICkgKTtcbiAgICB9KTtcbiAgfVxufTtcblxuQ29sbGVjdGlvbi5wcm90b3R5cGUuX2FwcGx5ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX3VwZGF0aW5nID0gdHJ1ZTtcbiAgdGhpcy4kcGFyZW50LiR2aWV3LnNldChcbiAgICB0aGlzLiRrZXksXG4gICAgdGhpcy5tYXAoIGZ1bmN0aW9uKCBpdGVtICkge1xuICAgICAgcmV0dXJuIGl0ZW0uJHZpZXc7XG4gICAgfSlcbiAgKTtcbiAgdGhpcy5fdXBkYXRpbmcgPSBmYWxzZTtcbn07XG4iLCJpbXBvcnQgeyB0eXBlT2YgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IFZhbGlkYXRpb25FcnJvciBmcm9tICcuL1ZhbGlkYXRpb25FcnJvcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbGxlY3Rpb25TY2hlbWEoIHR5cGUgKSB7XG4gIGlmICggISggdGhpcyBpbnN0YW5jZW9mIENvbGxlY3Rpb25TY2hlbWEgKSApIHtcbiAgICByZXR1cm4gbmV3IENvbGxlY3Rpb25TY2hlbWEoIHR5cGUgKTtcbiAgfVxuXG4gIHRoaXMudHlwZSA9IHR5cGU7XG59XG5cbkNvbGxlY3Rpb25TY2hlbWEucHJvdG90eXBlLmNhc3QgPSBmdW5jdGlvbiggdmFsdWUgKSB7XG4gIGlmICggdmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICB2YWx1ZSA9IG51bGw7XG4gIH1cbiAgaWYgKCB0eXBlT2YoIHZhbHVlICkgPT09ICdhcnJheScgKSB7XG4gICAgdmFyIHR5cGUgPSB0aGlzLnR5cGU7XG4gICAgcmV0dXJuIHZhbHVlLm1hcCggZnVuY3Rpb24oIGl0ZW0gKSB7XG4gICAgICByZXR1cm4gdHlwZS5jYXN0KCBpdGVtICk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59O1xuXG5Db2xsZWN0aW9uU2NoZW1hLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uKCB2YWx1ZSApIHtcbiAgaWYgKCB0eXBlT2YoIHZhbHVlICkgIT09ICdhcnJheScgKSB7XG4gICAgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvciggJ1ZhbHVlIG11c3QgYmUgYW4gYXJyYXkuJyApO1xuICB9XG4gIHZhciB0eXBlID0gdGhpcy50eXBlO1xuICB2YWx1ZS5mb3JFYWNoKCBmdW5jdGlvbiggaXRlbSwgaW5kZXggKSB7XG4gICAgdHJ5IHtcbiAgICAgIHR5cGUudmFsaWRhdGUoIGl0ZW0gKTtcbiAgICB9IGNhdGNoICggZXJyICkge1xuICAgICAgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvciggJ1RoZSBpdGVtIGF0IGluZGV4ICcgKyBpbmRleCArICcgaXMgaW52YWxpZC4nLCBlcnIgKTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIi8qKlxuICogQHBhcmFtIHtNb2RlbFNjaGVtYX0gc2NoZW1hXG4gKiBAcGFyYW0ge1ZpZXd9IHZpZXdcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTW9kZWwoIHNjaGVtYSwgdmlldyApIHtcbiAgdGhpcy4kc2NoZW1hID0gc2NoZW1hO1xuICB0aGlzLiR2aWV3ID0gdmlldztcbn1cblxuTW9kZWwucHJvdG90eXBlLmVkaXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuJHNjaGVtYS5jYXN0KCB0aGlzLiR2aWV3LmZvcmsoKSApO1xufTtcblxuTW9kZWwucHJvdG90eXBlLmNvbW1pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLiR2aWV3LmNvbW1pdCgpO1xufTtcblxuTW9kZWwucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuJHZpZXcucmVzZXQoKTtcbn07XG5cbk1vZGVsLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuJHZpZXcudG9KU09OKCk7XG59O1xuXG5Nb2RlbC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIG90aGVyICkge1xuICByZXR1cm4gb3RoZXIgPT09IHRoaXM7XG59O1xuIiwiaW1wb3J0IHsgY2xvbmVEZWVwIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBNb2RlbCBmcm9tICcuL01vZGVsJztcbmltcG9ydCBWaWV3IGZyb20gJy4vVmlldyc7XG5pbXBvcnQgQ29sbGVjdGlvblNjaGVtYSBmcm9tICcuL0NvbGxlY3Rpb25TY2hlbWEnO1xuaW1wb3J0IENvbGxlY3Rpb24gZnJvbSAnLi9Db2xsZWN0aW9uJztcbmltcG9ydCBwYXRoeSBmcm9tICdwYXRoeSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1vZGVsU2NoZW1hKCBwYXRocywgb3B0aW9ucyApIHtcbiAgdGhpcy5wYXRocyA9IHBhdGhzO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHRoaXMubWVtYmVycyA9IHRoaXMub3B0aW9ucy5tZW1iZXJzIHx8IHt9O1xuICBkZWxldGUgdGhpcy5vcHRpb25zLm1lbWJlcnM7XG5cbiAgaWYgKCB0aGlzLm1lbWJlcnMuaW5pdCApIHtcbiAgICB0aGlzLmluaXRpYWxpemVyID0gdGhpcy5tZW1iZXJzLmluaXQ7XG4gICAgZGVsZXRlIHRoaXMubWVtYmVycy5pbml0O1xuICB9XG59XG5cbk1vZGVsU2NoZW1hLnByb3RvdHlwZS5uZXcgPSBmdW5jdGlvbiggZGVmYXVsdHMgKSB7XG4gIHJldHVybiB0aGlzLmNhc3QoIGNsb25lRGVlcCggZGVmYXVsdHMgfHwge30gKSApO1xufTtcblxuTW9kZWxTY2hlbWEucHJvdG90eXBlLmNhc3QgPSBmdW5jdGlvbiggdmFsdWUgKSB7XG4gIGlmICggdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgdmlldztcbiAgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIE1vZGVsICkge1xuICAgIGlmICggdmFsdWUuJHNjaGVtYSA9PT0gdGhpcyApIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgdmlldyA9IHZhbHVlLiR2aWV3O1xuICB9IGVsc2UgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIFZpZXcgKSB7XG4gICAgdmlldyA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIGlmICggdmFsdWUudG9KU09OICkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS50b0pTT04oKTtcbiAgICB9XG4gICAgdmlldyA9IG5ldyBWaWV3KCk7XG4gICAgdmlldy5tZXJnZSggdmFsdWUgKTtcbiAgfVxuICB2YXIgbW9kZWwgPSBuZXcgTW9kZWwoIHRoaXMsIHZpZXcgKTtcbiAgdGhpcy5hZGRQYXRocyggbW9kZWwgKTtcbiAgdGhpcy5hZGRNZW1iZXJzKCBtb2RlbCApO1xuICBpZiAoIHRoaXMuaW5pdGlhbGl6ZXIgKSB7XG4gICAgdGhpcy5pbml0aWFsaXplci5jYWxsKCBtb2RlbCApO1xuICB9XG4gIHJldHVybiBtb2RlbDtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtNb2RlbH0gbW9kZWxcbiAqL1xuTW9kZWxTY2hlbWEucHJvdG90eXBlLmFkZFBhdGhzID0gZnVuY3Rpb24oIG1vZGVsICkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMucGF0aHMuZm9yRWFjaCggZnVuY3Rpb24oIHBhdGggKSB7XG4gICAgaWYgKFxuICAgICAgcGF0aC50eXBlLnR5cGUgaW5zdGFuY2VvZiBDb2xsZWN0aW9uU2NoZW1hICYmXG4gICAgICBwYXRoLnR5cGUudHlwZS50eXBlLnR5cGUgaW5zdGFuY2VvZiBNb2RlbFNjaGVtYVxuICAgICkge1xuICAgICAgc2VsZi5hZGRDb2xsZWN0aW9uUGF0aCggbW9kZWwsIHBhdGggKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5hZGRBdHRyaWJ1dGVQYXRoKCBtb2RlbCwgcGF0aCApO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7TW9kZWx9IG1vZGVsXG4gKiBAcGFyYW0ge1NjaGVtYVBhdGh9IHBhdGhcbiAqL1xuTW9kZWxTY2hlbWEucHJvdG90eXBlLmFkZENvbGxlY3Rpb25QYXRoID0gZnVuY3Rpb24oIG1vZGVsLCBwYXRoICkge1xuICB2YXIgY29sbGVjdGlvbiA9IG5ldyBDb2xsZWN0aW9uKCBtb2RlbCwgcGF0aC5uYW1lLCBwYXRoLnR5cGUudHlwZS50eXBlLnR5cGUgKTtcbiAgcGF0aHkoIHBhdGgubmFtZSApLm92ZXJyaWRlKCBtb2RlbCwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge01vZGVsfSBtb2RlbFxuICogQHBhcmFtIHtTY2hlbWFQYXRofSBwYXRoXG4gKi9cbk1vZGVsU2NoZW1hLnByb3RvdHlwZS5hZGRBdHRyaWJ1dGVQYXRoID0gZnVuY3Rpb24oIG1vZGVsLCBwYXRoICkge1xuICBwYXRoeSggcGF0aC5uYW1lICkub3ZlcnJpZGUoIG1vZGVsLCB7XG4gICAgaW5pdGlhbGl6ZTogZmFsc2UsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwYXRoLnR5cGUuY2FzdCggbW9kZWwuJHZpZXcuZ2V0KCBwYXRoLm5hbWUgKSApO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgICBtb2RlbC4kdmlldy5zZXQoIHBhdGgubmFtZSwgcGF0aC50eXBlLmNhc3QoIHZhbHVlICkgKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge01vZGVsfSBtb2RlbFxuICovXG5Nb2RlbFNjaGVtYS5wcm90b3R5cGUuYWRkTWVtYmVycyA9IGZ1bmN0aW9uKCBtb2RlbCApIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBPYmplY3Qua2V5cyggdGhpcy5tZW1iZXJzICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcbiAgICB2YXIgbWVtYmVyID0gc2VsZi5tZW1iZXJzWyBrZXkgXTtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHt9O1xuXG4gICAgaWYgKCB0eXBlb2YgbWVtYmVyID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgc2VsZi5hZGRGdW5jdGlvbk1lbWJlciggbW9kZWwsIG1lbWJlciwga2V5ICk7XG4gICAgfSBlbHNlIGlmICggISFtZW1iZXIgJiYgdHlwZW9mIG1lbWJlciA9PT0gJ29iamVjdCcgKSB7XG4gICAgICBzZWxmLmFkZFByb3BlcnR5TWVtYmVyKCBtb2RlbCwgbWVtYmVyLCBrZXkgKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge01vZGVsfSBtb2RlbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY1xuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICovXG5Nb2RlbFNjaGVtYS5wcm90b3R5cGUuYWRkRnVuY3Rpb25NZW1iZXIgPSBmdW5jdGlvbiggbW9kZWwsIGZ1bmMsIGtleSApIHtcbiAgZnVuYyA9IGJpbmQoIGZ1bmMsIG1vZGVsICk7XG4gIHBhdGh5KCBrZXkgKS5vdmVycmlkZSggbW9kZWwsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtNb2RlbH0gbW9kZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBhY2Nlc3NvcnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqL1xuTW9kZWxTY2hlbWEucHJvdG90eXBlLmFkZFByb3BlcnR5TWVtYmVyID0gZnVuY3Rpb24oIG1vZGVsLCBhY2Nlc3NvcnMsIGtleSApIHtcbiAgdmFyIGRlc2NyaXB0b3IgPSB7fTtcbiAgaWYgKCB0eXBlb2YgYWNjZXNzb3JzLmdldCA9PT0gJ2Z1bmN0aW9uJyApIHtcbiAgICBkZXNjcmlwdG9yLmdldCA9IGJpbmQoIGFjY2Vzc29ycy5nZXQsIG1vZGVsICk7XG4gIH1cbiAgaWYgKCB0eXBlb2YgYWNjZXNzb3JzLnNldCA9PT0gJ2Z1bmN0aW9uJyApIHtcbiAgICBkZXNjcmlwdG9yLnNldCA9IGJpbmQoIGFjY2Vzc29ycy5zZXQsIG1vZGVsICk7XG4gIH1cbiAgaWYgKCBPYmplY3Qua2V5cyggZGVzY3JpcHRvciApLmxlbmd0aCA+IDAgKSB7XG4gICAgZGVzY3JpcHRvci5pbml0aWFsaXplID0gZmFsc2U7XG4gICAgcGF0aHkoIGtleSApLm92ZXJyaWRlKCBtb2RlbCwgZGVzY3JpcHRvciApO1xuICB9XG59O1xuIiwiaW1wb3J0IFZhbGlkYXRpb25FcnJvciBmcm9tICcuL1ZhbGlkYXRpb25FcnJvcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9iamVjdFNjaGVtYSggcGF0aHMgKSB7XG4gIGlmICggISggdGhpcyBpbnN0YW5jZW9mIE9iamVjdFNjaGVtYSApICkge1xuICAgIHJldHVybiBuZXcgT2JqZWN0U2NoZW1hKCBwYXRocyApO1xuICB9XG5cbiAgdGhpcy5wYXRocyA9IHBhdGhzO1xufVxuXG5PYmplY3RTY2hlbWEucHJvdG90eXBlLmNhc3QgPSBmdW5jdGlvbiggdmFsdWUgKSB7XG4gIGlmICggdmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICB2YWx1ZSA9IG51bGw7XG4gIH1cbiAgcmV0dXJuIHRoaXMucGF0aHMucmVkdWNlKCBmdW5jdGlvbiggb2JqZWN0LCBwYXRoICkge1xuICAgIHBhdGguc2V0KCBvYmplY3QsIHBhdGgudHlwZS5jYXN0KCBwYXRoLmdldCggdmFsdWUgKSApICk7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSwge30gKTtcbn07XG5cbk9iamVjdFNjaGVtYS5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiggdmFsdWUgKSB7XG4gIHRoaXMucGF0aHMuZm9yRWFjaCggZnVuY3Rpb24oIHBhdGggKSB7XG4gICAgdHJ5IHtcbiAgICAgIHBhdGgudHlwZS52YWxpZGF0ZSggcGF0aC5nZXQoIHZhbHVlICkgKTtcbiAgICB9IGNhdGNoICggZXJyICkge1xuICAgICAgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvciggJ1RoZSB2YWx1ZSBhdCAnICsgcGF0aC5uYW1lICsgJyBpcyBpbnZhbGlkLicgKTtcbiAgICB9XG4gIH0pO1xufTtcbiIsImltcG9ydCBPYmplY3RTY2hlbWEgZnJvbSAnLi9PYmplY3RTY2hlbWEnO1xuaW1wb3J0IENvbGxlY3Rpb25TY2hlbWEgZnJvbSAnLi9Db2xsZWN0aW9uU2NoZW1hJztcbmltcG9ydCBWYWx1ZVNjaGVtYSwgeyBBbnkgfSBmcm9tICcuL1ZhbHVlU2NoZW1hJztcbmltcG9ydCBTY2hlbWFQYXRoIGZyb20gJy4vU2NoZW1hUGF0aCc7XG5pbXBvcnQgeyBjbG9uZURlZXAsIHR5cGVPZiB9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNjaGVtYVBhcnNlcigpIHtcbiAgaWYgKCAhKCB0aGlzIGluc3RhbmNlb2YgU2NoZW1hUGFyc2VyICkgKSB7XG4gICAgcmV0dXJuIG5ldyBTY2hlbWFQYXJzZXIoKTtcbiAgfVxuXG4gIHRoaXMub2JqZWN0RmFjdG9yeSA9IE9iamVjdFNjaGVtYTtcbiAgdGhpcy5jb2xsZWN0aW9uRmFjdG9yeSA9IENvbGxlY3Rpb25TY2hlbWE7XG4gIHRoaXMudmFsdWVGYWN0b3J5ID0gVmFsdWVTY2hlbWE7XG4gIHRoaXMucGF0aEZhY3RvcnkgPSBTY2hlbWFQYXRoO1xuXG4gIHRoaXMudHlwZU1hdGNoZXJzID0gW107XG4gIHRoaXMudHlwZU1hdGNoZXJzLnB1c2goIGZ1bmN0aW9uKCBub2RlICkge1xuICAgIHJldHVybiBub2RlIGluc3RhbmNlb2YgT2JqZWN0U2NoZW1hO1xuICB9KTtcbn1cblxuU2NoZW1hUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKCBub2RlICkge1xuICBpZiAoIHRoaXMuaXNWYWx1ZU5vZGUoIG5vZGUgKSApIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZUZyb21Ob2RlKCBub2RlICk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMub2JqZWN0RmFjdG9yeSggdGhpcy5wYXRoc0Zyb21Ob2RlKCAnJywgbm9kZSApICk7XG4gIH1cbn07XG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IGJhc2VcbiAqIEBwYXJhbSB7Kn0gbm9kZVxuICogQHJldHVybnMge0FycmF5LjxTY2hlbWFQYXRoPn1cbiAqL1xuU2NoZW1hUGFyc2VyLnByb3RvdHlwZS5wYXRoc0Zyb21Ob2RlID0gZnVuY3Rpb24oIGJhc2UsIG5vZGUgKSB7XG4gIGlmICggbm9kZSA9PT0gdW5kZWZpbmVkICkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBub2RlID0gdGhpcy52YWx1ZUZyb21MaXRlcmFsKCBub2RlICk7XG4gIGlmICggdGhpcy5pc1ZhbHVlTm9kZSggbm9kZSApICkge1xuICAgIHJldHVybiBbIHRoaXMucGF0aEZhY3RvcnkoIGJhc2UsIHRoaXMudmFsdWVGcm9tTm9kZSggbm9kZSApICkgXTtcbiAgfVxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJldHVybiBPYmplY3Qua2V5cyggbm9kZSApLm1hcCggZnVuY3Rpb24oIGtleSApIHtcbiAgICByZXR1cm4gc2VsZi5wYXRoc0Zyb21Ob2RlKFxuICAgICAgYmFzZSA/IGJhc2UgKyAnLicgKyBrZXkgOiBrZXksXG4gICAgICBub2RlWyBrZXkgXVxuICAgICk7XG4gIH0pLnJlZHVjZSggZnVuY3Rpb24oIHBhdGhzLCBtb3JlUGF0aHMgKSB7XG4gICAgcmV0dXJuIHBhdGhzLmNvbmNhdCggbW9yZVBhdGhzICk7XG4gIH0sIFtdICk7XG59O1xuXG5TY2hlbWFQYXJzZXIucHJvdG90eXBlLnZhbHVlRnJvbUxpdGVyYWwgPSBmdW5jdGlvbiggbm9kZSApIHtcbiAgaWYgKCBub2RlID09PSBudWxsICkge1xuICAgIHJldHVybiBBbnk7XG4gIH1cbiAgcmV0dXJuIG5vZGU7XG59O1xuXG5TY2hlbWFQYXJzZXIucHJvdG90eXBlLmlzVHlwZU5vZGUgPSBmdW5jdGlvbiggbm9kZSApIHtcbiAgdmFyIHJlc3VsdCA9IHR5cGVvZiBub2RlID09PSAnZnVuY3Rpb24nIHx8IHR5cGVPZiggbm9kZSApID09PSAnYXJyYXknO1xuICBpZiAoICFyZXN1bHQgKSB7XG4gICAgZm9yICggdmFyIGkgPSAwLCBsZW4gPSB0aGlzLnR5cGVNYXRjaGVycy5sZW5ndGg7IGkgPCBsZW4gJiYgIXJlc3VsdDsgaSsrICkge1xuICAgICAgcmVzdWx0ID0gdGhpcy50eXBlTWF0Y2hlcnNbIGkgXSggbm9kZSApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuU2NoZW1hUGFyc2VyLnByb3RvdHlwZS5pc1R5cGVOb2RlV2l0aE9wdGlvbnMgPSBmdW5jdGlvbiggbm9kZSApIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiZcbiAgICBub2RlICE9PSBudWxsICYmXG4gICAgdGhpcy5pc1R5cGVOb2RlKCBub2RlLnR5cGUgKVxuICApO1xufTtcblxuU2NoZW1hUGFyc2VyLnByb3RvdHlwZS5vcHRpb25zRnJvbU5vZGUgPSBmdW5jdGlvbiggbm9kZSApIHtcbiAgdmFyIG9wdGlvbnMgPSBjbG9uZURlZXAoIG5vZGUgKTtcbiAgZGVsZXRlIG9wdGlvbnMudHlwZTtcbiAgcmV0dXJuIG9wdGlvbnM7XG59O1xuXG5TY2hlbWFQYXJzZXIucHJvdG90eXBlLnR5cGVGcm9tTm9kZSA9IGZ1bmN0aW9uKCBub2RlICkge1xuICBpZiAoIHRoaXMuaXNDb2xsZWN0aW9uVHlwZSggbm9kZSApICkge1xuICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25Gcm9tTm9kZSggbm9kZSApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBub2RlO1xuICB9XG59O1xuXG5TY2hlbWFQYXJzZXIucHJvdG90eXBlLmlzQ29sbGVjdGlvblR5cGUgPSBmdW5jdGlvbiggdmFsdWUgKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gQXJyYXkgfHwgdHlwZU9mKCB2YWx1ZSApID09PSAnYXJyYXknO1xufTtcblxuU2NoZW1hUGFyc2VyLnByb3RvdHlwZS5pc1ZhbHVlTm9kZSA9IGZ1bmN0aW9uKCBub2RlICkge1xuICByZXR1cm4gdGhpcy5pc1R5cGVOb2RlKCBub2RlICkgfHwgdGhpcy5pc1R5cGVOb2RlV2l0aE9wdGlvbnMoIG5vZGUgKTtcbn07XG5cblNjaGVtYVBhcnNlci5wcm90b3R5cGUudmFsdWVGcm9tTm9kZSA9IGZ1bmN0aW9uKCBub2RlICkge1xuICBpZiAoIHRoaXMuaXNUeXBlTm9kZVdpdGhPcHRpb25zKCBub2RlICkgKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVGYWN0b3J5KFxuICAgICAgdGhpcy50eXBlRnJvbU5vZGUoIG5vZGUudHlwZSApLFxuICAgICAgdGhpcy5vcHRpb25zRnJvbU5vZGUoIG5vZGUgKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVGYWN0b3J5KCB0aGlzLnR5cGVGcm9tTm9kZSggbm9kZSApICk7XG4gIH1cbn07XG5cblNjaGVtYVBhcnNlci5wcm90b3R5cGUuY29sbGVjdGlvbkZyb21Ob2RlID0gZnVuY3Rpb24oIG5vZGUgKSB7XG4gIGlmICggdHlwZU9mKCBub2RlICkgPT09ICdhcnJheScgJiYgbm9kZS5sZW5ndGggPiAwICkge1xuICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25GYWN0b3J5KCB0aGlzLnZhbHVlRnJvbU5vZGUoIG5vZGVbMF0gKSApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25GYWN0b3J5KCB0aGlzLnZhbHVlRmFjdG9yeSggQW55ICkgKTtcbiAgfVxufTtcbiIsImltcG9ydCBwYXRoeSBmcm9tICdwYXRoeSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNjaGVtYVBhdGgoIHBhdGgsIHR5cGUgKSB7XG4gIGlmICggISggdGhpcyBpbnN0YW5jZW9mIFNjaGVtYVBhdGggKSApIHtcbiAgICByZXR1cm4gbmV3IFNjaGVtYVBhdGgoIHBhdGgsIHR5cGUgKTtcbiAgfVxuXG4gIHRoaXMubmFtZSA9IHBhdGg7XG4gIHRoaXMudHlwZSA9IHR5cGU7XG4gIHRoaXMuYWNjZXNzb3IgPSBwYXRoeSggcGF0aCApO1xufVxuXG5TY2hlbWFQYXRoLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiggb2JqZWN0ICkge1xuICByZXR1cm4gdGhpcy5hY2Nlc3Nvci5nZXQoIG9iamVjdCApO1xufTtcblxuU2NoZW1hUGF0aC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oIG9iamVjdCwgdmFsdWUgKSB7XG4gIHRoaXMuYWNjZXNzb3Iuc2V0KCBvYmplY3QsIHZhbHVlICk7XG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2NoZW1hVHlwZSggY2FzdGVyICkge1xuICB0aGlzLmNhc3QgPSBjYXN0ZXI7XG59XG5cblNjaGVtYVR5cGUucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24oKSB7fTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFZhbGlkYXRpb25FcnJvciggbWVzc2FnZSwgZXJyb3IgKSB7XG4gIHRoaXMubmFtZSA9ICdWYWxpZGF0aW9uRXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICB0aGlzLmVycm9yID0gZXJyb3IgfHwgbnVsbDtcbn1cblxuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEVycm9yLnByb3RvdHlwZSApO1xuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZhbGlkYXRpb25FcnJvcjtcbiIsImltcG9ydCBTY2hlbWFUeXBlIGZyb20gJy4vU2NoZW1hVHlwZSc7XG5pbXBvcnQgVmFsaWRhdGlvbkVycm9yIGZyb20gJy4vVmFsaWRhdGlvbkVycm9yJztcblxuZXhwb3J0IGZ1bmN0aW9uIEFueSggdmFsdWUgKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1NjaGVtYVR5cGV8RnVuY3Rpb259IHR5cGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVmFsdWVTY2hlbWEoIHR5cGUsIG9wdGlvbnMgKSB7XG4gIGlmICggISggdGhpcyBpbnN0YW5jZW9mIFZhbHVlU2NoZW1hICkgKSB7XG4gICAgcmV0dXJuIG5ldyBWYWx1ZVNjaGVtYSggdHlwZSwgb3B0aW9ucyApO1xuICB9XG5cbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBpZiAoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICkge1xuICAgIGlmICggdHlwZSA9PT0gQW55ICkge1xuICAgICAgdGhpcy5vcHRpb25zLm9wdGlvbmFsID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy50eXBlID0gbmV3IFNjaGVtYVR5cGUoIHR5cGUgKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICB9XG5cbiAgdGhpcy52YWxpZGF0b3JzID0gW107XG4gIHRoaXMudmFsaWRhdG9ycy5wdXNoKCBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgaWYgKCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgaWYgKCB0aGlzLm9wdGlvbnMub3B0aW9uYWwgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvciggJ1ZhbHVlIGNhbm5vdCBiZSBudWxsLicgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5WYWx1ZVNjaGVtYS5wcm90b3R5cGUuY2FzdCA9IGZ1bmN0aW9uKCB2YWx1ZSApIHtcbiAgaWYgKCB2YWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuICAgIHZhbHVlID0gbnVsbDtcbiAgfVxuICBpZiAoIHRoaXMub3B0aW9ucy5vcHRpb25hbCApIHtcbiAgICBpZiAoIHZhbHVlID09PSBudWxsICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzLnR5cGUuY2FzdCggdmFsdWUgKTtcbn07XG5cblZhbHVlU2NoZW1hLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uKCB2YWx1ZSApIHtcbiAgZm9yICggdmFyIGkgPSAwLCBsZW4gPSB0aGlzLnZhbGlkYXRvcnMubGVuZ3RoOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgaWYgKCB0aGlzLnZhbGlkYXRvcnNbIGkgXS5jYWxsKCB0aGlzLCB2YWx1ZSApID09PSB0cnVlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICB0aGlzLnR5cGUudmFsaWRhdGUoIHZhbHVlICk7XG59O1xuIiwiaW1wb3J0IHBhdGh5IGZyb20gJ3BhdGh5JztcbmltcG9ydCB7IG1lcmdlLCBjbG9uZURlZXAgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBWaWV3KCB2aWV3ICkge1xuICB0aGlzLnZpZXcgPSB2aWV3O1xuICB0aGlzLl9sb2NhbCA9IHt9O1xuICB0aGlzLnJlc2V0KCk7XG59XG5cblZpZXcucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCBwYXRoICkge1xuICB2YXIgdmFsdWUgPSBwYXRoeSggcGF0aCApLmdldCggdGhpcy5fbG9jYWwudmFsdWUgKTtcbiAgaWYgKCB2YWx1ZSA9PT0gdW5kZWZpbmVkICYmIHRoaXMudmlldyApIHtcbiAgICByZXR1cm4gdGhpcy52aWV3LmdldCggcGF0aCApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufTtcblxuVmlldy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oIHBhdGgsIHZhbHVlICkge1xuICBwYXRoeSggcGF0aCApLnNldCggdGhpcy5fbG9jYWwudmFsdWUsIHZhbHVlICk7XG59O1xuXG5WaWV3LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAvLyBXZSdsbCBzdG9yZSBhY3R1YWwgdmFsdWUgYXMgYSBzdWItcHJvcGVydHkgc28gdGhhdCBvYnNlcnZlcnMgY2FuIGxpc3RlblxuICAvLyBmb3IgY2hhbmdlcyBldmVuIGlmIHRoZSBlbnRpcmUgb2JqZWN0IGdldHMgcmVwbGFjZWQuXG4gIHRoaXMuX2xvY2FsLnZhbHVlID0ge307XG59O1xuXG5WaWV3LnByb3RvdHlwZS5tZXJnZSA9IGZ1bmN0aW9uKCBvYmplY3QgKSB7XG4gIG1lcmdlKCB0aGlzLl9sb2NhbC52YWx1ZSwgb2JqZWN0ICk7XG59O1xuXG5WaWV3LnByb3RvdHlwZS5yZXBsYWNlID0gZnVuY3Rpb24oIG9iamVjdCApIHtcbiAgdGhpcy5fbG9jYWwudmFsdWUgPSBvYmplY3QgfHwge307XG59O1xuXG5WaWV3LnByb3RvdHlwZS5jb21taXQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy52aWV3ICkge1xuICAgIHRocm93IG5ldyBFcnJvciggJ05vIHN1YnZpZXcgdG8gY29tbWl0IHRvIScgKTtcbiAgfVxuICB0aGlzLnZpZXcubWVyZ2UoIHRoaXMuX2xvY2FsLnZhbHVlICk7XG4gIHRoaXMucmVzZXQoKTtcbn07XG5cblZpZXcucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbWVyZ2UoXG4gICAgY2xvbmVEZWVwKCB0aGlzLl9sb2NhbC52YWx1ZSApLFxuICAgIHRoaXMudmlldyAmJiB0aGlzLnZpZXcudG9KU09OKCkgfHwge31cbiAgKTtcbn07XG5cblZpZXcucHJvdG90eXBlLmZvcmsgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBWaWV3KCB0aGlzICk7XG59O1xuXG5WaWV3LnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKCBwYXRoLCBsaXN0ZW5lciApIHtcbiAgaWYgKCB0aGlzLnZpZXcgKSB7XG4gICAgdGhpcy52aWV3LndhdGNoKCBwYXRoLCBsaXN0ZW5lciApO1xuICB9XG4gIHBhdGh5KCBwYXRoICkud2F0Y2goIHRoaXMuX2xvY2FsLnZhbHVlLCBsaXN0ZW5lciApO1xufTtcbiIsImltcG9ydCBTY2hlbWFQYXJzZXIgZnJvbSAnLi9TY2hlbWFQYXJzZXInO1xuaW1wb3J0IE1vZGVsU2NoZW1hIGZyb20gJy4vTW9kZWxTY2hlbWEnO1xuXG52YXIgYmFzaWNTY2hlbWFQYXJzZXIgPSBuZXcgU2NoZW1hUGFyc2VyKCk7XG52YXIgbW9kZWxTY2hlbWFQYXJzZXIgPSBuZXcgU2NoZW1hUGFyc2VyKCk7XG5tb2RlbFNjaGVtYVBhcnNlci50eXBlTWF0Y2hlcnMucHVzaCggZnVuY3Rpb24oIG5vZGUgKSB7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgTW9kZWxTY2hlbWE7XG59KTtcblxuZXhwb3J0IGZ1bmN0aW9uIFR5cGUoIG5vZGUgKSB7XG4gIHJldHVybiBiYXNpY1NjaGVtYVBhcnNlci5wYXJzZSggbm9kZSApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2NoZW1hKCBub2RlLCBvcHRpb25zICkge1xuICByZXR1cm4gbmV3IE1vZGVsU2NoZW1hKCBtb2RlbFNjaGVtYVBhcnNlci5wYXJzZSggbm9kZSApLnBhdGhzLCBvcHRpb25zICk7XG59XG5cbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ29sbGVjdGlvbiB9IGZyb20gJy4vQ29sbGVjdGlvbic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbGxlY3Rpb25TY2hlbWEgfSBmcm9tICcuL0NvbGxlY3Rpb25TY2hlbWEnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBNb2RlbCB9IGZyb20gJy4vTW9kZWwnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBNb2RlbFNjaGVtYSB9IGZyb20gJy4vTW9kZWxTY2hlbWEnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBPYmplY3RTY2hlbWEgfSBmcm9tICcuL09iamVjdFNjaGVtYSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNjaGVtYVBhcnNlciB9IGZyb20gJy4vU2NoZW1hUGFyc2VyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2NoZW1hUGF0aCB9IGZyb20gJy4vU2NoZW1hUGF0aCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZhbGlkYXRpb25FcnJvciB9IGZyb20gJy4vVmFsaWRhdGlvbkVycm9yJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVmFsdWVTY2hlbWEsIEFueSB9IGZyb20gJy4vVmFsdWVTY2hlbWEnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWaWV3IH0gZnJvbSAnLi9WaWV3JztcblxuaW1wb3J0IHsgbWVyZ2UsIGNsb25lRGVlcCB9IGZyb20gJy4vdXRpbCc7XG5leHBvcnQgdmFyIHV0aWwgPSB7XG4gIG1lcmdlOiBtZXJnZSxcbiAgY2xvbmVEZWVwOiBjbG9uZURlZXBcbn07XG4iLCJleHBvcnQgZnVuY3Rpb24gY2xvbmVEZWVwKCBvYmplY3QgKSB7XG5cbiAgZnVuY3Rpb24gY2xvbmVWYWx1ZSggdmFsdWUgKSB7XG4gICAgaWYgKCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsICkge1xuICAgICAgaWYgKCB0eXBlT2YoIG9iamVjdCApID09PSAnYXJyYXknICkge1xuICAgICAgICByZXR1cm4gY2xvbmVBcnJheSggYXJyYXkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjbG9uZU9iamVjdCggdmFsdWUgKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvbmVPYmplY3QoIG9iamVjdCApIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoIG9iamVjdCApLm1hcCggZnVuY3Rpb24oIGtleSApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICB2YWx1ZTogY2xvbmVWYWx1ZSggb2JqZWN0WyBrZXkgXSApXG4gICAgICB9O1xuICAgIH0pLnJlZHVjZSggZnVuY3Rpb24oIG9iaiwgaXRlbSApIHtcbiAgICAgIG9ialsgaXRlbS5rZXkgXSA9IGl0ZW0udmFsdWU7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sIHt9ICk7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9uZUFycmF5KCBhcnJheSApIHtcbiAgICByZXR1cm4gYXJyYXkubWFwKCBmdW5jdGlvbiggaXRlbSApIHtcbiAgICAgIHJldHVybiBjbG9uZVZhbHVlKCBpdGVtICk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gY2xvbmVWYWx1ZSggb2JqZWN0ICk7XG59XG5cbi8qKlxuICogTWVyZ2VzIHRoZSByZW1haW5pbmcgcGFyYW1ldGVycyBpbnRvIHRoZSBmaXJzdCBwYXJhbWV0ZXIuXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gb3RoZXIgVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZSggb2JqZWN0LCBvdGhlciApIHtcbiAgaWYgKCAhb2JqZWN0IHx8IHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnICkge1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICB2YXIgc3RhY2sgPSBbXTtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzLCAxICk7XG4gIGZvciAoIHZhciBpID0gMCwgbGVuID0gYXJncy5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcbiAgICBpZiAoICEhYXJnc1sgaSBdICYmIHR5cGVvZiBhcmdzWyBpIF0gPT09ICdvYmplY3QnICkge1xuICAgICAgc3RhY2sucHVzaCh7XG4gICAgICAgIGRlc3Q6IG9iamVjdCxcbiAgICAgICAgc3JjOiBhcmdzWyBpIF0sXG4gICAgICAgIG1lcmdlOiBtZXJnZU9iamVjdHNcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHdoaWxlICggc3RhY2subGVuZ3RoID4gMCApIHtcbiAgICB2YXIgY29udGV4dCA9IHN0YWNrLnBvcCgpO1xuICAgIGNvbnRleHQubWVyZ2UoIGNvbnRleHQuZGVzdCwgY29udGV4dC5zcmMgKTtcbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG5cbiAgZnVuY3Rpb24gbWVyZ2VPYmplY3RzKCBhLCBiICkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoIGIgKTtcbiAgICBmb3IgKCB2YXIgaSA9IDAsIGxlbiA9IGtleXMubGVuZ3RoOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBtZXJnZVNldCggYSwga2V5c1sgaSBdLCBiWyBrZXlzWyBpIF0gXSApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlU2V0KCBzb3VyY2UsIGtleSwgYlZhbHVlICkge1xuICAgIHZhciBhVmFsdWUgPSBzb3VyY2VbIGtleSBdO1xuICAgIC8vIFRoZSBvbmx5IHRpbWVzICdiJyBkb2Vzbid0IGdvIGludG8gJ2EnIGlzIHdoZW4gJ2InIGlzIHVuZGVmaW5lZCwgb3JcbiAgICAvLyBib3RoICdhJyBhbmQgJ2InIGFyZSBvYmplY3RzLCBvciB3aGVuIGJvdGggJ2EnIGFuZCAnYicgYXJlIGFycmF5cy5cbiAgICBpZiAoIGJWYWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICB0eXBlb2YgYVZhbHVlID09PSAnb2JqZWN0JyAmJiBhVmFsdWUgIT09IG51bGwgJiZcbiAgICAgIHR5cGVvZiBiVmFsdWUgPT09ICdvYmplY3QnICYmIGJWYWx1ZSAhPT0gbnVsbFxuICAgICkge1xuICAgICAgc3RhY2sucHVzaCh7XG4gICAgICAgIGRlc3Q6IGFWYWx1ZSxcbiAgICAgICAgc3JjOiBiVmFsdWUsXG4gICAgICAgIG1lcmdlOiBtZXJnZU9iamVjdHNcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzb3VyY2VbIGtleSBdID0gYlZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogR2V0cyB0aGUgaW50ZXJuYWwgSmF2YVNjcmlwdCBbW0NsYXNzXV0gb2YgYW4gb2JqZWN0LlxuICogaHR0cDovL3BlcmZlY3Rpb25raWxscy5jb20vaW5zdGFuY2VvZi1jb25zaWRlcmVkLWhhcm1mdWwtb3ItaG93LXRvLXdyaXRlLWEtcm9idXN0LWlzYXJyYXlcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHR5cGVPZiggdmFsdWUgKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoIHZhbHVlIClcbiAgICAubWF0Y2goIC9eXFxbb2JqZWN0XFxzKC4qKVxcXSQvIClbMV0udG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbmRleCggYXJyYXksIG1hdGNoZXIgKSB7XG4gIGZvciAoIHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgaWYgKCBtYXRjaGVyKCBhcnJheVsgaSBdICkgKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZCggYXJyYXksIG1hdGNoZXIgKSB7XG4gIHZhciBpbmRleCA9IGZpbmRJbmRleCggYXJyYXksIG1hdGNoZXIgKTtcbiAgaWYgKCBpbmRleCA+IC0xICkge1xuICAgIHJldHVybiBhcnJheVsgaW5kZXggXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZCggZnVuYywgY29udGV4dCApIHtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzLCAyICk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuYy5hcHBseSggY29udGV4dCwgYXJncy5jb25jYXQoIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMgKSApICk7XG4gIH07XG59XG4iXX0=
