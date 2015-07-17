import CollectionSchema from './CollectionSchema';
import ModelInspector from './ModelInspector';
import ModelSchema from './ModelSchema';
import Path from '@stephenbunch/path';

export default class ModelDecorator {
  /**
   * @param {Array.<SchemaPath>} paths
   * @param {Function} collectionFactory
   */
  constructor( paths, collectionFactory ) {
    this._paths = paths;
    this._collectionFactory = collectionFactory;
    this._inspector = new ModelInspector();
  }

  /**
   * @param {Model} model
   */
  decorate( model ) {
    this._paths.forEach( path => {
      if ( this._isCollectionPath( path ) ) {
        this._addCollectionPath( model, path );
      } else {
        this._addAttributePath( model, path );
      }
    });
  }

  /**
   * @param {SchemaPath} path
   * @returns {Boolean}
   */
  _isCollectionPath( path ) {
    return (
      path.pathType.valueType instanceof CollectionSchema &&
      path.pathType.valueType.collectionType.valueType instanceof ModelSchema
    );
  }

  /**
   * @param {Model} model
   * @param {SchemaPath} path
   */
  _addCollectionPath( model, path ) {
    var collection = this._collectionFactory(
      model,
      path.name,
      path.pathType.valueType.collectionType.valueType
    );
    Path( path.name ).override( model, {
      get: () => {
        return collection;
      }
    });
  }

  /**
   * @param {Model} model
   * @param {SchemaPath} path
   */
  _addAttributePath( model, path ) {
    Path( path.name ).override( model, {
      initialize: false,
      persist: true,
      get: () => {
        return path.pathType.cast( this._inspector.viewForModel( model ).get( path.name ), {
          parent: model
        });
      },
      set: value => {
        this._inspector.viewForModel( model ).set(
          path.name,
          path.pathType.cast( value, {
            parent: model
          })
        );
      }
    });
  }
};
