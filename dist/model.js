( function() {

'use strict';

var isBrowser = !( typeof module !== 'undefined' && module.exports );
var pathy = isBrowser ? window.pathy : require( 'pathy' );

var exports = ( function() {
var exports = {};


exports.CollectionSchema = CollectionSchema;

function CollectionSchema( type, options ) {
  this.type = type;
  this.options = options || {};
}

CollectionSchema.prototype.cast = function( value ) {
  if ( value === undefined ) {
    value = null;
  }
  if ( this.options.optional ) {
    if ( value === null ) {
      return null;
    }
  }
  var self = this;
  if ( typeOf( value ) === 'array' ) {
    return value.map( function( item ) {
      return self.type.cast( item );
    });
  } else {
    return [];
  }
};

CollectionSchema.prototype.validate = function( value ) {
  if ( value === null || value === undefined ) {
    if ( this.options.optional ) {
      return;
    } else {
      throw new ValidationError( 'Value cannot be null.' );
    }
  }
  if ( typeOf( value ) !== 'array' ) {
    throw new ValidationError( 'Value must be an array.' );
  }
  var self = this;
  value.forEach( function( item, index ) {
    try {
      self.validate( item );
    } catch ( err ) {
      throw new ValidationError( 'The item at index ' + index + ' is invalid.', err );
    }
  });
};


exports.Schema = Schema;

function Schema( node, options ) {
  if ( isCollectionNode( node ) ) {
    return schemaFromCollectionNode( node );
  }

  this.paths = [];
  this.options = options || {};
  this.paths = pathsFromNode( '', node );
}

Schema.prototype.cast = function( value ) {
  if ( value === undefined ) {
    value = null;
  }
  if ( this.options.optional ) {
    if ( value === null ) {
      return null;
    }
  }
  return this.paths.reduce( function( object, path ) {
    path.set( object, path.type.cast( path.get( value ) ) );
    return object;
  }, {} );
};

Schema.prototype.validate = function( value ) {
  if ( value === null || value === undefined ) {
    if ( this.options.optional ) {
      return;
    } else {
      throw new ValidationError( 'Value cannot be null.' );
    }
  }
  if ( typeOf( value ) !== 'object' ) {
    throw new ValidationError( 'Value must be an object.' );
  }
  this.paths.forEach( function( path ) {
    try {
      path.type.validate( path.get( value ) );
    } catch ( err ) {
      throw new ValidationError( 'The value at ' + path.name + ' is invalid.' );
    }
  });
};

/**
 * @param {String} base
 * @param {*} node
 * @returns {Array.<SchemaPath>}
 */
function pathsFromNode( base, node ) {
  if ( node === undefined ) {
    return [];
  }
  if ( isCollectionNode( node ) ) {
    return [ new SchemaPath( base, schemaFromCollectionNode( node ) ) ];
  }
  node = nodeFromValue( node );
  if ( typeof node === 'function' ) {
    return [ new SchemaPath( base, new ValueSchema( node ) ) ];
  }
  if ( typeof node.type === 'function' ) {
    return [
      new SchemaPath(
        base,
        new ValueSchema(
          node.type,
          optionsFromValueNode( node )
        )
      )
    ];
  }
  return Object.keys( node ).map( function( key ) {
    return pathsFromNode(
      base ? base + '.' + key : key,
      node[ key ]
    );
  }).reduce( function( paths, morePaths ) {
    return paths.concat( morePaths );
  }, [] );
}

function nodeFromValue( value ) {
  if ( value instanceof Schema || typeof value === 'function' ) {
    return value;
  } else if ( typeof value === 'boolean' ) {
    return Boolean;
  } else if ( typeof value === 'string' ) {
    return String;
  } else if ( typeof value === 'number' ) {
    return Number;
  } else if ( typeOf( value ) === 'array' && value.length === 0 ) {
    return Array;
  } else if ( value === null || Object.keys( value ).length === 0 ) {
    return Object;
  } else {
    return value;
  }
}

/**
 * @param {*} node
 * @returns {CollectionSchema}
 */
function schemaFromCollectionNode( node ) {
  if ( typeOf( node ) === 'array' && node.length > 0 ) {
    node = node[0];
    if ( typeof node === 'function' ) {
      return new CollectionSchema( new ValueSchema( node ) );
    } else if ( isValueNodeWithOptions( node ) ) {
      return new CollectionSchema(
        new ValueSchema(
          node.type,
          optionsFromValueNode( node[0] )
        )
      );
    } else {
      return new CollectionSchema( new Schema( node ) );
    }
  } else {
    return new CollectionSchema( Object );
  }
}

/**
 * @param {*} node
 * @returns {Boolean}
 */
function isCollectionNode( node ) {
  return (
    node === Array ||
    typeOf( node ) === 'array' ||
    isValueNodeWithOptions( node ) && (
      node.type === Array ||
      typeOf( node.type ) === 'Array'
    )
  );
}

/**
 * @param {*} node
 * @returns {Boolean}
 */
function isValueNodeWithOptions( node ) {
  return (
    typeof node === 'object' &&
    node !== null &&
    typeof node.type === 'function'
  );
}

/**
 * @param {Object} node
 * @returns {Object}
 */
function optionsFromValueNode( node ) {
  var options = cloneDeep( node );
  delete options.type;
  return options;
}

exports.SchemaPath = SchemaPath;

function SchemaPath( path, type ) {
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

exports.ValidationError = ValidationError;

function ValidationError( message, error ) {
  this.name = 'ValidationError';
  this.message = message;
  this.error = error || null;
}

ValidationError.prototype = Object.create( Error.prototype );
ValidationError.prototype.constructor = ValidationError;

exports.ValueSchema = ValueSchema;

function ValueSchema( caster, options ) {
  this.caster = caster;
  this.options = options || {};
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
  return this.caster( value );
};

ValueSchema.prototype.validate = function( value ) {
  if ( value === null || value === undefined ) {
    if ( this.options.optional ) {
      return;
    } else {
      throw new ValidationError( 'Value cannot be null.' );
    }
  }
};

exports.View = View;

function View( view ) {
  this.view = view;
  this.reset();
}

View.prototype.get = function( path ) {
  var value = pathy( path ).get( this._local );
  if ( value === undefined && this.view ) {
    return this.view.get( path );
  } else {
    return value;
  }
};

View.prototype.set = function( path, value ) {
  pathy( path ).set( this._local, value );
};

View.prototype.reset = function() {
  this._local = {};
};

View.prototype.merge = function( object ) {
  merge( this._local, object );
};

View.prototype.commit = function() {
  if ( !this.view ) {
    throw new Error( 'No subview to commit to!' );
  }
  this.view.merge( this._local );
  this.reset();
};

View.prototype.toJSON = function() {
  return merge(
    cloneDeep( this._local ),
    this.view && this.view.toJSON() || {}
  );
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