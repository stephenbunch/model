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
