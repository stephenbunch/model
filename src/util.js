export function cloneDeep( object ) {

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
}

/**
 * Gets the internal JavaScript [[Class]] of an object.
 * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray
 *
 * @private
 * @param {*} value
 * @returns {String}
 */
export function typeOf( value ) {
  return Object.prototype.toString.call( value )
    .match( /^\[object\s(.*)\]$/ )[1].toLowerCase();
}

export function findIndex( array, matcher ) {
  for ( var i = 0, len = array.length; i < len; i++ ) {
    if ( matcher( array[ i ] ) ) {
      return i;
    }
  }
  return -1;
}

export function find( array, matcher ) {
  var index = findIndex( array, matcher );
  if ( index > -1 ) {
    return array[ index ];
  } else {
    return null;
  }
}

export function bind( func, context ) {
  var args = Array.prototype.slice.call( arguments, 2 );
  return function() {
    return func.apply( context, args.concat( Array.prototype.slice.call( arguments ) ) );
  };
}
