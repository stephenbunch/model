import ObjectSchema from './ObjectSchema';
import CollectionSchema from './CollectionSchema';
import ValueSchema from './ValueSchema';
import SchemaPath from './SchemaPath';
import { typeOf, factoryFromClass } from './util';
import Type from './Type';
import Symbol from './Symbol';

export default class SchemaParser {
  constructor() {
    this.objectFactory = factoryFromClass( ObjectSchema );
    this.collectionFactory = factoryFromClass( CollectionSchema );
    this.valueFactory = factoryFromClass( ValueSchema );
    this.pathFactory = factoryFromClass( SchemaPath );

    this.typeResolvers = new Map();
    this.typeResolvers.set( null, Type.any );
    this.typeResolvers.set( String, Type.string );
    this.typeResolvers.set( Number, Type.number );

    this.nodeResolvers = [];
  }

  /**
   * @param {*} node
   * @returns {Schema}
   */
  schemaFromNode( node ) {
    node = this._resolveNode( node );
    if ( this._isValueNode( node ) ) {
      return this._valueFromNode( node );
    } else {
      return this.objectFactory( this._pathsFromNode( '', node ) );
    }
  }

  clone() {
    var parser = new SchemaParser();
    parser.objectFactory = this.objectFactory;
    parser.collectionFactory = this.collectionFactory;
    parser.valueFactory = this.valueFactory;
    parser.pathFactory = this.pathFactory;
    for ( let [ key, value ] of this.typeResolvers ) {
      parser.typeResolvers.set( key, value );
    }
    parser.nodeResolvers = parser.nodeResolvers.slice();
    return parser;
  }

  /**
   * @param {String} base
   * @param {*} node
   * @returns {Array.<SchemaPath>}
   */
  _pathsFromNode( base, node ) {
    if ( node === undefined ) {
      return [];
    }
    if ( this._isValueNode( node ) ) {
      return [ this.pathFactory( base, this._valueFromNode( node ) ) ];
    }
    return Object.keys( node ).map( key => {
      return this._pathsFromNode(
        base ? base + '.' + key : key,
        this._resolveNode( node[ key ] )
      );
    }).reduce( function( paths, morePaths ) {
      return paths.concat( morePaths );
    }, [] );
  }

  /**
   * @param {*} node
   * @returns {*}
   */
  _resolveNode( node ) {
    var history = [];
    while ( this.typeResolvers.has( node ) ) {
      if ( history.indexOf( node ) > -1 ) {
        throw new Error( 'Type resolution resulted in an infinite loop!' );
      }
      node = this.typeResolvers.get( node );
    }
    for ( let resolver of this.nodeResolvers ) {
      let resolution = resolver( node );
      if ( resolution !== undefined ) {
        node = resolution;
        break;
      }
    }
    return node;
  }

  /**
   * @param {*} node
   * @returns {Boolean}
   */
  _isTypeNode( node ) {
    return (
      typeof node === 'function' ||
      Array.isArray( node ) ||
      node && typeof node.cast === 'function'
    );
  }

  _typeFromNode( node ) {
    if ( this._isCollectionType( node ) ) {
      return this._collectionFromNode( node );
    } else {
      return node;
    }
  }

  /**
   * @param {*} value
   * @returns {Boolean}
   */
  _isCollectionType( value ) {
    return value === Array || Array.isArray( value );
  }

  /**
   * @param {*} value
   * @returns {Boolean}
   */
  _isGenericType( value ) {
    return value && value[ Symbol.generic ] === true;
  }

  /**
   * @param {*} node
   * @returns {Boolean}
   */
  _isValueNode( node ) {
    return this._isTypeNode( node ) || this._isGenericType( node );
  }

  _valueFromNode( node ) {
    if ( this._isGenericType( node ) ) {
      return this.valueFactory(
        node.get( node.of.map( node => this.schemaFromNode( node ) ) )
      );
    } else {
      return this.valueFactory( this._typeFromNode( node ) );
    }
  }

  _collectionFromNode( node ) {
    if ( Array.isArray( node ) && node.length > 0 ) {
      return this.collectionFactory( this.schemaFromNode( node[0] ) );
    } else {
      return this.collectionFactory( this.valueFactory( Type.any ) );
    }
  }
}
