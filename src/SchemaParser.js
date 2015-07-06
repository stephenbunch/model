import ObjectSchema from './ObjectSchema';
import CollectionSchema from './CollectionSchema';
import ValueSchema from './ValueSchema';
import SchemaPath from './SchemaPath';
import { cloneDeep, typeOf, factoryFromClass } from './util';
import Type from './Type';
import Symbol from './Symbol';

export default class SchemaParser {
  constructor() {
    this.objectFactory = factoryFromClass( ObjectSchema );
    this.collectionFactory = factoryFromClass( CollectionSchema );
    this.valueFactory = factoryFromClass( ValueSchema );
    this.pathFactory = factoryFromClass( SchemaPath );

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
      return Type.any;
    } else if ( node === String ) {
      return Type.string;
    } else if ( node === Number ) {
      return Type.number;
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

  isGenericType( value ) {
    return value && value[ Symbol.generic ] === true;
  }

  isValueNode( node ) {
    return this.isTypeNode( node ) || this.isGenericType( node );
  }

  valueFromNode( node ) {
    if ( this.isGenericType( node ) ) {
      let schemas = node.of.map( node => this.schemaFromNode( node ) );
      return this.valueFactory( ( value, options ) => {
        return node.cast( value, options, schemas );
      });
    } else {
      return this.valueFactory( this.typeFromNode( node ) );
    }
  }

  collectionFromNode( node ) {
    if ( typeOf( node ) === 'array' && node.length > 0 ) {
      return this.collectionFactory( this.valueFromNode( node[0] ) );
    } else {
      return this.collectionFactory( this.valueFactory( Type.any ) );
    }
  }
}
