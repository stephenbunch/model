import ObjectSchema from './ObjectSchema';
import CollectionSchema from './CollectionSchema';
import ValueSchema, { Any } from './ValueSchema';
import SchemaPath from './SchemaPath';
import { cloneDeep, typeOf, makeFactory } from './util';

export default class SchemaParser {
  constructor() {
    this.objectFactory = makeFactory( ObjectSchema );
    this.collectionFactory = makeFactory( CollectionSchema );
    this.valueFactory = makeFactory( ValueSchema );
    this.pathFactory = makeFactory( SchemaPath );

    this.typeMatchers = [];
    this.typeMatchers.push( function( node ) {
      return node instanceof ObjectSchema;
    });
  }

  schemaFromNode( node ) {
    if ( this.isValueNode( node ) ) {
      return this.valueFromNode( node );
    } else {
      return this.objectFactory( this.pathsFromNode( '', node ) );
    }
  }

  /**
   * @param {String} base
   * @param {*} node
   * @returns {Array.<SchemaPath>}
   */
  pathsFromNode( base, node ) {
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
  }

  valueFromLiteral( node ) {
    if ( node === null ) {
      return Any;
    }
    return node;
  }

  isTypeNode( node ) {
    var result = typeof node === 'function' || typeOf( node ) === 'array';
    if ( !result ) {
      for ( var i = 0, len = this.typeMatchers.length; i < len && !result; i++ ) {
        result = this.typeMatchers[ i ]( node );
      }
    }
    return result;
  }

  isTypeNodeWithOptions( node ) {
    return (
      typeof node === 'object' &&
      node !== null &&
      this.isTypeNode( node.type )
    );
  }

  optionsFromNode( node ) {
    var options = cloneDeep( node );
    delete options.type;
    return options;
  }

  typeFromNode( node ) {
    if ( this.isCollectionType( node ) ) {
      return this.collectionFromNode( node );
    } else {
      return node;
    }
  }

  isCollectionType( value ) {
    return value === Array || typeOf( value ) === 'array';
  }

  isValueNode( node ) {
    return this.isTypeNode( node ) || this.isTypeNodeWithOptions( node );
  }

  valueFromNode( node ) {
    if ( this.isTypeNodeWithOptions( node ) ) {
      return this.valueFactory(
        this.typeFromNode( node.type ),
        this.optionsFromNode( node )
      );
    } else {
      return this.valueFactory( this.typeFromNode( node ) );
    }
  }

  collectionFromNode( node ) {
    if ( typeOf( node ) === 'array' && node.length > 0 ) {
      return this.collectionFactory( this.valueFromNode( node[0] ) );
    } else {
      return this.collectionFactory( this.valueFactory( Any ) );
    }
  }
}
