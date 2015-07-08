import Path from '@stephenbunch/path';
import ModelInspector from './ModelInspector';

var inspector = new ModelInspector();

export default class ModelDecorator {
  /**
   * @param {Array.<SchemaPath>} paths
   * @param {Function} collectionFactory
   * @param {Function} collectionMatcher
   */
  constructor( paths, collectionFactory, collectionMatcher ) {
    this.paths = paths;
    this.collectionFactory = collectionFactory;
    this.collectionMatcher = collectionMatcher;
  }

  /**
   * @param {Model} model
   */
  decorate( model ) {
    this.paths.forEach( path => {
      if ( this.collectionMatcher( path ) ) {
        this._addCollectionPath( model, path );
      } else {
        this._addAttributePath( model, path );
      }
    });
  }

  /**
   * @param {Model} model
   * @param {SchemaPath} path
   */
  _addCollectionPath( model, path ) {
    var collection = this.collectionFactory(
      model,
      path.name,
      path.pathType.valueType.collectionType.valueType
    );
    Path( path.name ).override( model, {
      get: function() {
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
      get: function() {
        return path.pathType.cast( inspector.viewForModel( model ).get( path.name ), {
          parent: model
        });
      },
      set: function( value ) {
        inspector.viewForModel( model ).set(
          path.name,
          path.pathType.cast( value, {
            parent: model
          })
        );
      }
    });
  }
};
