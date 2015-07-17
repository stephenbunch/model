/**
 * Merges the remaining parameters into the first parameter.
 * @param {Object|Array} object The destination object.
 * @param {...Object} other The source objects.
 * @returns {Object} Returns object.
 */
export function merge( object, other ) {
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
};

/**
 * Gets the index of the first match or -1 if no matches are found.
 * @param {Array} array
 * @param {Function} matcher A matching function that returns true or false.
 * @returns {Number}
 */
export function findIndex( array, matcher ) {
  for ( var i = 0, len = array.length; i < len; i++ ) {
    if ( matcher( array[ i ] ) ) {
      return i;
    }
  }
  return -1;
};

/**
 * Returns the first match or null of no matches are found.
 * @param {Array} array
 * @param {Function} matcher
 * @returns {*|null}
 */
export function find( array, matcher ) {
  var index = findIndex( array, matcher );
  if ( index > -1 ) {
    return array[ index ];
  } else {
    return null;
  }
};

/**
 * Creates a factory function that returns a new instance of the specified
 * class.
 * @param {Function} Class
 * @returns {Function}
 */
export function factoryFromClass( Class ) {
  return function() {
    var instance = Object.create( Class.prototype );
    Class.prototype.constructor.apply( instance, arguments );
    return instance;
  };
};
