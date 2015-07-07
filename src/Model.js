import View from './View';
import { cloneDeep } from './util';
import ModelDecorator from './ModelDecorator';
import CollectionSchema from './CollectionSchema';
import Collection from './Collection';
import SchemaParser from './SchemaParser';
import ModelEditor from './ModelEditor';
import ObjectView from './ObjectView';

var parser = new SchemaParser();
parser.typeMatchers.push( function( node ) {
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
  static attrs = {}

  static get schema() {
    if ( !this._schema ) {
      this._schema = parser.schemaFromNode( this.attrs || {} );
    }
    return this._schema;
  }

  /**
   * Gets the decorator used to generate the schema paths for instances of this
   * type.
   * @type {ModelDecorator}
   */
  static get decorator() {
    if ( !this._decorator ) {
      this._decorator = new ModelDecorator(
        this.schema.paths,
        Collection,
        isCollectionPath
      );
    }
    return this._decorator;
  }

  /**
   * Gets the model editor used to edit and inspect instances of this type.
   * @type {ModelEditor}
   */
  static get editor() {
    if ( !this._editor ) {
      this._editor = new ModelEditor();
    }
    return this._editor;
  }

  /**
   * Creates a new model instance.
   * @param {Object} [defaults]
   * @returns {Model}
   */
  static new( defaults ) {
    return this.cast( defaults );
  }

  /**
   * Casts an existing value to a new model instance.
   * @param {View|Model|Object|null} [value]
   * @param {Object} [meta]
   * @returns {Model}
   */
  static cast( value, meta ) {
    if ( value instanceof this ) {
      return value;
    }
    var model = Object.create( this.prototype );
    if ( value === undefined || value === null ) {
      value = {};
    }
    var view;
    if ( value instanceof View ) {
      view = value;
    } else {
      view = new View( new ObjectView( value ) );
    }
    this.editor.inspector.setViewForModel( model, view );
    meta = meta || {};
    this.editor.inspector.setParentOfModel( model, meta.parent );
    this.editor.inspector.setParentCollectionOfModel( model, meta.parentCollection );
    this.prototype.constructor.call( model );
    return model;
  }

  static validate( value ) {
    this.schema.validate( value );
  }

  constructor() {
    if ( !this.constructor.editor.inspector.viewForModel( this ) ) {
      this.constructor.editor.inspector.setViewForModel( this, new View() );
    }
    this.constructor.decorator.decorate( this );
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    return this.constructor.editor.inspector.viewForModel( this ).toJSON();
  }

  /**
   * @param {*} other
   * @returns {Boolean}
   */
  equals( other ) {
    return other === this;
  }
};
