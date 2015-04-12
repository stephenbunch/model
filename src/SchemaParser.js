exports.SchemaParser = SchemaParser;

function SchemaParser( objectFactory, collectionFactory, valueFactory ) {
  this.objectFactory = objectFactory;
  this.collectionFactory = collectionFactory;
  this.valueFactory = valueFactory;
}

SchemaParser.prototype.parse = function( node ) {
  if ( this.isCollectionNode( node ) ) {
    return this.collectionSchemaFromNode( node );
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
  if ( this.isCollectionNode( node ) ) {
    return [ new SchemaPath( base, this.collectionSchemaFromNode( node ) ) ];
  }
  node = this.parseValue( node );
  if ( this.isValueNode( node ) ) {
    return [ new SchemaPath( base, this.valueFactory( node ) ) ];
  } else if ( this.isValueNodeWithOptions( node ) ) {
    return [
      new SchemaPath(
        base,
        this.valueFactory(
          node.type,
          this.optionsFromNode( node )
        )
      )
    ];
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

SchemaParser.prototype.parseValue = function( value ) {
  if ( this.isValueNode( value ) ) {
    return value;
  } else if ( value === null ) {
    return Any;
  } else if ( typeof value === 'boolean' ) {
    return Boolean;
  } else if ( typeof value === 'string' ) {
    return String;
  } else if ( typeof value === 'number' ) {
    return Number;
  } else if ( typeOf( value ) === 'array' && value.length === 0 ) {
    return Array;
  } else if ( Object.keys( value ).length === 0 ) {
    return Object;
  } else {
    return value;
  }
};

SchemaParser.prototype.collectionSchemaFromNode = function( node ) {
  if ( this.isTypeNodeWithOptions( node ) ) {
    return this.valueFactory(
      this.collectionFactory( this.collectionTypeFromNode( node.type ) ),
      this.optionsFromNode( node )
    );
  } else {
    return this.valueFactory(
      this.collectionFactory(
        this.collectionTypeFromNode( node )
      )
    );
  }
};

SchemaParser.prototype.collectionTypeFromNode = function( node ) {
  if ( typeOf( node ) === 'array' && node.length > 0 ) {
    node = node[0];
    if ( this.isValueNode( node ) ) {
      return this.valueFactory( node );
    } else if ( this.isValueNodeWithOptions( node ) ) {
      return this.valueFactory(
        node.type,
        this.optionsFromNode( node[0] )
      );
    } else {
      return this.parse( node );
    }
  } else {
    return this.valueFactory( Any );
  }
};

SchemaParser.prototype.isCollectionNode = function( node ) {
  return (
    node === Array ||
    typeOf( node ) === 'array' ||
    this.isTypeNodeWithOptions( node ) && (
      node.type === Array ||
      typeOf( node.type ) === 'array'
    )
  );
};

SchemaParser.prototype.isValueNodeWithOptions = function( node ) {
  return (
    typeof node === 'object' &&
    node !== null &&
    this.isValueNode( node.type )
  );
};

SchemaParser.prototype.isValueNode = function( node ) {
  return typeof node === 'function';
};

SchemaParser.prototype.isTypeNodeWithOptions = function( node ) {
  return (
    typeof node === 'object' &&
    node !== null &&
    (
      this.isValueNode( node.type ) ||
      typeOf( node.type ) === 'array'
    )
  );
};

SchemaParser.prototype.optionsFromNode = function( node ) {
  var options = cloneDeep( node );
  delete options.type;
  return options;
};
