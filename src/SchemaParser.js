import ObjectSchema from './ObjectSchema';
import CollectionSchema from './CollectionSchema';
import ValueSchema, { Any } from './ValueSchema';
import SchemaPath from './SchemaPath';
import { cloneDeep, typeOf } from './util';

export default function SchemaParser() {
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
  node = this.valueFromLiteral( node );
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

SchemaParser.prototype.valueFromLiteral = function( node ) {
  if ( node === null ) {
    return Any;
  }
  return node;
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
