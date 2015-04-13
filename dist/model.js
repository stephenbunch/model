( function() {

'use strict';

var isBrowser = !( typeof module !== 'undefined' && module.exports );
var pathy = isBrowser ? window.pathy : require( 'pathy' );

var exports = ( function() {
var exports = {};

var basicSchemaParser = new SchemaParser();
var modelSchemaParser = new SchemaParser();
modelSchemaParser.typeMatchers.push( function( node ) {
  return node instanceof ModelSchema;
});

exports.Type = function( node ) {
  return basicSchemaParser.parse( node );
};

exports.Schema = function( node, options ) {
  return new ModelSchema( modelSchemaParser.parse( node ).paths, options );
};

exports.Collection = Collection;

/**
 * @param {Model} view
 * @param {String} key
 * @param {ModelSchema} schema
 */
function Collection( parent, key, schema ) {
  this.$parent = parent;
  this.$key = key;
  this.$schema = schema;

  this.$parent.$view.watch( this.$key, bind( this._didChange, this ) );
  this._didChange();
}

Collection.prototype = Object.create( Array.prototype );
Collection.prototype.constructor = Collection;

Collection.prototype.add = function( item ) {
  if ( this.indexOf( item ) === -1 ) {
    this.remove( item );
    item = this.$schema.cast( item );
    this.push( item );
    this._apply();
  }
  return item;
};

Collection.prototype.remove = function( item ) {
  var index = this.indexOf( item );
  if ( index === -1 ) {
    index = findIndex( this, function( model ) {
      return model.equals( item );
    });
  }
  if ( index > -1 ) {
    this.splice( index, 1 );
    this._apply();
  }
};

Collection.prototype.new = function( defaults ) {
  return this.$schema.new( defaults );
};

Collection.prototype.addNew = function( defaults ) {
  return this.add( this.new( defaults ) );
};

Collection.prototype.clear = function() {
  this.length = 0;
  this._apply();
};

Collection.prototype.toJSON = function() {
  return this.map( function( item ) {
    return item.toJSON();
  });
};

Collection.prototype._didChange = function() {
  var self = this;
  if ( !this._updating ) {
    this.length = 0;
    ( this.$parent.$view.get( this.$key ) || [] ).forEach( function( item ) {
      self.push( self.$schema.cast( item ) );
    });
  }
};

Collection.prototype._apply = function() {
  this._updating = true;
  this.$parent.$view.set(
    this.$key,
    this.map( function( item ) {
      return item.$view;
    })
  );
  this._updating = false;
};

exports.CollectionSchema = CollectionSchema;

function CollectionSchema( type ) {
  if ( !( this instanceof CollectionSchema ) ) {
    return new CollectionSchema( type );
  }

  this.type = type;
}

CollectionSchema.prototype.cast = function( value ) {
  if ( value === undefined ) {
    value = null;
  }
  if ( typeOf( value ) === 'array' ) {
    var type = this.type;
    return value.map( function( item ) {
      return type.cast( item );
    });
  } else {
    return [];
  }
};

CollectionSchema.prototype.validate = function( value ) {
  if ( typeOf( value ) !== 'array' ) {
    throw new ValidationError( 'Value must be an array.' );
  }
  var type = this.type;
  value.forEach( function( item, index ) {
    try {
      type.validate( item );
    } catch ( err ) {
      throw new ValidationError( 'The item at index ' + index + ' is invalid.', err );
    }
  });
};

exports.Model = Model;

/**
 * @param {ModelSchema} schema
 * @param {View} view
 */
function Model( schema, view ) {
  this.$schema = schema;
  this.$view = view;
}

Model.prototype.edit = function() {
  return this.$schema.cast( this.$view.fork() );
};

Model.prototype.commit = function() {
  this.$view.commit();
};

Model.prototype.toJSON = function() {
  return this.$view.toJSON();
};

Model.prototype.equals = function( other ) {
  return other === this;
};

exports.ModelSchema = ModelSchema;

function ModelSchema( paths, options ) {
  this.paths = paths;
  this.options = options || {};

  this.members = this.options.members || {};
  delete this.options.members;

  if ( this.members.init ) {
    this.initializer = this.members.init;
    delete this.members.init;
  }
}

ModelSchema.prototype.new = function( defaults ) {
  return this.cast( cloneDeep( defaults || {} ) );
};

ModelSchema.prototype.cast = function( value ) {
  if ( value === undefined || value === null ) {
    return null;
  }
  var view;
  if ( value instanceof Model ) {
    if ( value.$schema === this ) {
      return value;
    }
    view = value.$view;
  } else if ( value instanceof View ) {
    view = value;
  } else {
    if ( value.toJSON ) {
      value = value.toJSON();
    }
    view = new View();
    view.merge( value );
  }
  var model = new Model( this, view );
  this.addPaths( model );
  this.addMembers( model );
  if ( this.initializer ) {
    this.initializer.call( model );
  }
  return model;
};

/**
 * @param {Model} model
 */
ModelSchema.prototype.addPaths = function( model ) {
  var self = this;
  this.paths.forEach( function( path ) {
    if (
      path.type.type instanceof CollectionSchema &&
      path.type.type.type.type instanceof ModelSchema
    ) {
      self.addCollectionPath( model, path );
    } else {
      self.addAttributePath( model, path );
    }
  });
};

/**
 * @param {Model} model
 * @param {SchemaPath} path
 */
ModelSchema.prototype.addCollectionPath = function( model, path ) {
  var collection = new Collection( model, path.name, path.type.type.type.type );
  pathy( path.name ).override( model, {
    get: function() {
      return collection;
    }
  });
};

/**
 * @param {Model} model
 * @param {SchemaPath} path
 */
ModelSchema.prototype.addAttributePath = function( model, path ) {
  pathy( path.name ).override( model, {
    initialize: false,
    get: function() {
      return path.type.cast( model.$view.get( path.name ) );
    },
    set: function( value ) {
      model.$view.set( path.name, path.type.cast( value ) );
    }
  });
};

/**
 * @param {Model} model
 */
ModelSchema.prototype.addMembers = function( model ) {
  var self = this;
  Object.keys( this.members ).forEach( function( key ) {
    var member = self.members[ key ];
    var descriptor = {};

    if ( typeof member === 'function' ) {
      self.addFunctionMember( model, member, key );
    } else if ( !!member && typeof member === 'object' ) {
      self.addPropertyMember( model, member, key );
    }
  });
};

/**
 * @param {Model} model
 * @param {Function} func
 * @param {String} key
 */
ModelSchema.prototype.addFunctionMember = function( model, func, key ) {
  func = bind( func, model );
  pathy( key ).override( model, {
    get: function() {
      return func;
    }
  });
};

/**
 * @param {Model} model
 * @param {Object} accessors
 * @param {String} key
 */
ModelSchema.prototype.addPropertyMember = function( model, accessors, key ) {
  var descriptor = {};
  if ( typeof accessors.get === 'function' ) {
    descriptor.get = bind( accessors.get, model );
  }
  if ( typeof accessors.set === 'function' ) {
    descriptor.set = bind( accessors.set, model );
  }
  if ( Object.keys( descriptor ).length > 0 ) {
    descriptor.initialize = false;
    pathy( key ).override( model, descriptor );
  }
};

exports.ObjectSchema = ObjectSchema;

function ObjectSchema( paths ) {
  if ( !( this instanceof ObjectSchema ) ) {
    return new ObjectSchema( paths );
  }

  this.paths = paths;
}

ObjectSchema.prototype.cast = function( value ) {
  if ( value === undefined ) {
    value = null;
  }
  return this.paths.reduce( function( object, path ) {
    path.set( object, path.type.cast( path.get( value ) ) );
    return object;
  }, {} );
};

ObjectSchema.prototype.validate = function( value ) {
  this.paths.forEach( function( path ) {
    try {
      path.type.validate( path.get( value ) );
    } catch ( err ) {
      throw new ValidationError( 'The value at ' + path.name + ' is invalid.' );
    }
  });
};

exports.SchemaParser = SchemaParser;

function SchemaParser() {
  if ( !( this instanceof SchemaParser ) ) {
    return new SchemaParser();
  }

  this.objectFactory = ObjectSchema;
  this.collectionFactory = CollectionSchema;
  this.valueFactory = ValueSchema;
  this.pathFactory = SchemaPath;

  this.typeMatchers = [];
  this.typeMatchers.push( function( node ) {
    return node instanceof ObjectSchema;
  });
}

SchemaParser.prototype.parse = function( node ) {
  if ( this.isValueNode( node ) ) {
    return this.valueFromNode( node );
  } else {
    return this.objectFactory( this.pathsFromNode( '', node ) );
  }
};

/**
 * @param {String} base
 * @param {*} node
 * @returns {Array.<SchemaPath>}
 */
SchemaParser.prototype.pathsFromNode = function( base, node ) {
  if ( node === undefined ) {
    return [];
  }
  if ( this.isValueNode( node ) ) {
    return [ this.pathFactory( base, this.valueFromNode( node ) ) ];
  }
  var self = this;
  return Object.keys( node ).map( function( key ) {
    return self.pathsFromNode(
      base ? base + '.' + key : key,
      node[ key ]
    );
  }).reduce( function( paths, morePaths ) {
    return paths.concat( morePaths );
  }, [] );
};

SchemaParser.prototype.isTypeNode = function( node ) {
  var result = typeof node === 'function' || typeOf( node ) === 'array';
  if ( !result ) {
    for ( var i = 0, len = this.typeMatchers.length; i < len && !result; i++ ) {
      result = this.typeMatchers[ i ]( node );
    }
  }
  return result;
};

SchemaParser.prototype.isTypeNodeWithOptions = function( node ) {
  return (
    typeof node === 'object' &&
    node !== null &&
    this.isTypeNode( node.type )
  );
};

SchemaParser.prototype.optionsFromNode = function( node ) {
  var options = cloneDeep( node );
  delete options.type;
  return options;
};

SchemaParser.prototype.typeFromNode = function( node ) {
  if ( this.isCollectionType( node ) ) {
    return this.collectionFromNode( node );
  } else {
    return node;
  }
};

SchemaParser.prototype.isCollectionType = function( value ) {
  return value === Array || typeOf( value ) === 'array';
};

SchemaParser.prototype.isValueNode = function( node ) {
  return this.isTypeNode( node ) || this.isTypeNodeWithOptions( node );
};

SchemaParser.prototype.valueFromNode = function( node ) {
  if ( this.isTypeNodeWithOptions( node ) ) {
    return this.valueFactory(
      this.typeFromNode( node.type ),
      this.optionsFromNode( node )
    );
  } else {
    return this.valueFactory( this.typeFromNode( node ) );
  }
};

SchemaParser.prototype.collectionFromNode = function( node ) {
  if ( typeOf( node ) === 'array' && node.length > 0 ) {
    return this.collectionFactory( this.valueFromNode( node[0] ) );
  } else {
    return this.collectionFactory( this.valueFactory( Any ) );
  }
};

exports.SchemaPath = SchemaPath;

function SchemaPath( path, type ) {
  if ( !( this instanceof SchemaPath ) ) {
    return new SchemaPath( path, type );
  }

  this.name = path;
  this.type = type;
  this.accessor = pathy( path );
}

SchemaPath.prototype.get = function( object ) {
  return this.accessor.get( object );
};

SchemaPath.prototype.set = function( object, value ) {
  this.accessor.set( object, value );
};

function SchemaType( caster ) {
  this.cast = caster;
}

SchemaType.prototype.validate = function() {};

exports.ValidationError = ValidationError;

function ValidationError( message, error ) {
  this.name = 'ValidationError';
  this.message = message;
  this.error = error || null;
}

ValidationError.prototype = Object.create( Error.prototype );
ValidationError.prototype.constructor = ValidationError;

exports.ValueSchema = ValueSchema;
exports.Any = Any;

function Any( value ) {
  return value;
}

/**
 * @param {SchemaType|Function} type
 * @param {Object} [options]
 */
function ValueSchema( type, options ) {
  if ( !( this instanceof ValueSchema ) ) {
    return new ValueSchema( type, options );
  }

  if ( typeof type === 'function' ) {
    this.type = new SchemaType( type );
  } else {
    this.type = type;
  }

  this.options = options || {};

  this.validators = [];
  this.validators.push( function( value ) {
    if ( value === null || value === undefined ) {
      if ( this.options.optional ) {
        return true;
      } else {
        throw new ValidationError( 'Value cannot be null.' );
      }
    }
  });
}

ValueSchema.prototype.cast = function( value ) {
  if ( value === undefined ) {
    value = null;
  }
  if ( this.options.optional ) {
    if ( value === null ) {
      return null;
    }
  }
  return this.type.cast( value );
};

ValueSchema.prototype.validate = function( value ) {
  for ( var i = 0, len = this.validators.length; i < len; i++ ) {
    if ( this.validators[ i ].call( this, value ) === true ) {
      return;
    }
  }
  this.type.validate( value );
};

exports.View = View;

function View( view ) {
  this.view = view;
  this._local = {};
  this.reset();
}

View.prototype.get = function( path ) {
  var value = pathy( path ).get( this._local.value );
  if ( value === undefined && this.view ) {
    return this.view.get( path );
  } else {
    return value;
  }
};

View.prototype.set = function( path, value ) {
  pathy( path ).set( this._local.value, value );
};

View.prototype.reset = function() {
  // We'll store actual value as a sub-property so that observers can listen
  // for changes even if the entire object gets replaced.
  this._local.value = {};
};

View.prototype.merge = function( object ) {
  merge( this._local.value, object );
};

View.prototype.commit = function() {
  if ( !this.view ) {
    throw new Error( 'No subview to commit to!' );
  }
  this.view.merge( this._local.value );
  this.reset();
};

View.prototype.toJSON = function() {
  return merge(
    cloneDeep( this._local.value ),
    this.view && this.view.toJSON() || {}
  );
};

View.prototype.fork = function() {
  return new View( this );
};

View.prototype.watch = function( path, listener ) {
  if ( this.view ) {
    this.view.watch( path, listener );
  }
  pathy( path ).watch( this._local.value, listener );
};

exports.util = {
  cloneDeep: cloneDeep,
  merge: merge
};

function cloneDeep( object ) {

  function cloneValue( value ) {
    if ( typeof value === 'object' && value !== null ) {
      if ( typeOf( object ) === 'array' ) {
        return cloneArray( array );
      }
      return cloneObject( value );
    }
    return value;
  }

  function cloneObject( object ) {
    return Object.keys( object ).map( function( key ) {
      return {
        key: key,
        value: cloneValue( object[ key ] )
      };
    }).reduce( function( obj, item ) {
      obj[ item.key ] = item.value;
      return obj;
    }, {} );
  }

  function cloneArray( array ) {
    return array.map( function( item ) {
      return cloneValue( item );
    });
  }

  return cloneValue( object );
}

/**
 * Merges the remaining parameters into the first parameter.
 * @param {Object|Array} object The destination object.
 * @param {...Object} other The source objects.
 * @returns {Object} Returns object.
 */
function merge( object, other ) {
  if ( !object || typeof object !== 'object' ) {
    return object;
  }

  var stack = [];
  var args = Array.prototype.slice.call( arguments, 1 );
  for ( var i = 0, len = args.length; i < len; i++ ) {
    if ( !!args[ i ] && typeof args[ i ] === 'object' ) {
      stack.push({
        dest: object,
        src: args[ i ],
        merge: mergeObjects
      });
    }
  }

  while ( stack.length > 0 ) {
    var context = stack.pop();
    context.merge( context.dest, context.src );
  }

  return object;

  function mergeObjects( a, b ) {
    var keys = Object.keys( b );
    for ( var i = 0, len = keys.length; i < len; i++ ) {
      mergeSet( a, keys[ i ], b[ keys[ i ] ] );
    }
  }

  function mergeSet( source, key, bValue ) {
    var aValue = source[ key ];
    // The only times 'b' doesn't go into 'a' is when 'b' is undefined, or
    // both 'a' and 'b' are objects, or when both 'a' and 'b' are arrays.
    if ( bValue === undefined ) {
      return;
    }
    if (
      typeof aValue === 'object' && aValue !== null &&
      typeof bValue === 'object' && bValue !== null
    ) {
      stack.push({
        dest: aValue,
        src: bValue,
        merge: mergeObjects
      });
      return;
    }
    source[ key ] = bValue;
  }
}

/**
 * Gets the internal JavaScript [[Class]] of an object.
 * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray
 *
 * @private
 * @param {*} value
 * @returns {String}
 */
function typeOf( value ) {
  return Object.prototype.toString.call( value )
    .match( /^\[object\s(.*)\]$/ )[1].toLowerCase();
}

function findIndex( array, matcher ) {
  for ( var i = 0, len = array.length; i < len; i++ ) {
    if ( matcher( array[ i ] ) ) {
      return i;
    }
  }
  return -1;
}

function find( array, matcher ) {
  var index = findIndex( array, matcher );
  if ( index > -1 ) {
    return array[ index ];
  } else {
    return null;
  }
}

function bind( func, context ) {
  return function() {
    return func.apply( context, arguments );
  };
}

return exports;
} () );

if ( isBrowser ) {
  if ( typeof define === 'function' && define.amd ) {
    define( function() {
      return exports;
    });
  }
  window.model = exports;
} else {
  module.exports = exports;
}

} () );

//# sourceMappingURL=model.js.map