import View from './View';
import { cloneDeep } from './util';
import ModelDecorator from './ModelDecorator';
import CollectionSchema from './CollectionSchema';
import Collection from './Collection';
import SchemaParser from './SchemaParser';

var modelParser = new SchemaParser();
modelParser.typeMatchers.push( function( node ) {
  return (
    node === Model ||
    node && node.prototype instanceof Model
  );
});

function isCollectionPath( path ) {
  return (
    path.type.type instanceof CollectionSchema &&
    path.type.type.type.type.prototype instanceof Model
  );
}

export default class Model {
  static schema = {}

  static get decorator() {
    if ( !this._decorator ) {
      var schema = modelParser.schemaFromNode( this.schema || {} );
      this._decorator = new ModelDecorator(
        schema.paths,
        Collection,
        isCollectionPath
      );
    }
    return this._decorator;
  }

  static new( defaults ) {
    return this.cast( defaults );
  }

  static cast( value, options ) {
    if ( value instanceof this ) {
      return value;
    }
    return new this( value, options );
  }

  /**
   * @param {*} value
   * @param {Object} [options]
   */
  constructor( value, options ) {
    if ( value === undefined || value === null ) {
      value = {};
    }
    var view;
    if ( value instanceof View ) {
      view = value;
    } else {
      if ( value.toJSON ) {
        value = value.toJSON();
      } else {
        value = cloneDeep( value );
      }
      view = new View();
      view.merge( value );
    }

    this.$view = view;

    options = options || {};
    this.$parent = options.parent;
    this.$parentCollection = options.parentCollection;

    this.constructor.decorator.decorate( this );
    this.init();
  }

  init() {

  }

  edit() {
    return new this.constructor( this.$view.fork() );
  }

  commit() {
    this.$view.commit();
  }

  reset() {
    this.$view.reset();
  }

  toJSON() {
    return this.$view.toJSON();
  }

  equals( other ) {
    return other === this;
  }
}
