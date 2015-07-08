import View from './View';
import { cloneDeep, factoryFromClass } from './util';
import ModelDecorator from './ModelDecorator';
import CollectionSchema from './CollectionSchema';
import ModelCollection from './ModelCollection';
import SchemaParser from './SchemaParser';
import ModelEditor from './ModelEditor';
import ObjectView from './ObjectView';

function isCollectionPath( path ) {
  return (
    path.pathType.valueType instanceof CollectionSchema && (
      path.pathType.valueType.collectionType.valueType === Model ||
      path.pathType.valueType.collectionType.valueType.prototype instanceof Model
    )
  );
}

const collectionFactory = factoryFromClass( ModelCollection );

const parser = new SchemaParser();
parser.typeMatchers.push( function( node ) {
  return (
    node === Model ||
    node && node.prototype instanceof Model
  );
});

const editor = new ModelEditor();

const _schema = Symbol();
const _decorator = Symbol();

export default class Model {
  static attrs = {}

  static collectionFactory = collectionFactory

  static get schema() {
    if ( !this[ _schema ] ) {
      this[ _schema ] = parser.schemaFromNode( this.attrs || {} );
    }
    return this[ _schema ];
  }

  /**
   * Gets the decorator used to generate the schema paths for instances of this
   * type.
   * @type {ModelDecorator}
   */
  static get [ _decorator ]() {
    return new ModelDecorator(
      this.schema.paths,
      this.collectionFactory,
      isCollectionPath
    )
  }

  /**
   * Creates a new model instance.
   * @param {Object} [defaults]
   * @returns {Model}
   */
  static create( defaults ) {
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
    editor.inspector.setViewForModel( model, view );
    meta = meta || {};
    editor.inspector.setParentOfModel( model, meta.parent );
    editor.inspector.setParentCollectionOfModel( model, meta.parentCollection );
    this.prototype.constructor.call( model );
    return model;
  }

  constructor() {
    if ( !editor.inspector.viewForModel( this ) ) {
      editor.inspector.setViewForModel( this, new View() );
    }
    this.constructor[ _decorator ].decorate( this );
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    return editor.inspector.viewForModel( this ).toJSON();
  }

  /**
   * @param {*} other
   * @returns {Boolean}
   */
  equals( other ) {
    return other === this;
  }
};
