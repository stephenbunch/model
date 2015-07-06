import $path from '@stephenbunch/path';
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
    var self = this;
    this.paths.forEach( function( path ) {
      if ( self.collectionMatcher( path ) ) {
        self._addCollectionPath( model, path );
      } else {
        self._addAttributePath( model, path );
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
      path.type.type.type.type
    );
    $path( path.name ).override( model, {
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
    $path( path.name ).override( model, {
      initialize: false,
      get: function() {
        return path.type.cast( inspector.viewForModel( model ).get( path.name ), {
          parent: model
        });
      },
      set: function( value ) {
        inspector.viewForModel( model ).set(
          path.name,
          path.type.cast( value, {
            parent: model
          })
        );
      }
    });
  }
};
