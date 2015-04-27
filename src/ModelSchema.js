import { cloneDeep, factoryFromClass, inherits } from './util';
import Model from './Model';
import View from './View';
import CollectionSchema from './CollectionSchema';
import Collection from './Collection';
import pathy from 'pathy';

export default class ModelSchema {
  /**
   * @param {Array.<SchemaPath>} paths
   * @param {Function} [ModelClass]
   */
  constructor( paths, ModelClass ) {
    this.paths = paths;
    this.modelFactory = factoryFromClass(
      ModelClass && inherits( ModelClass, Model ) ||
      Model
    );
    this.collectionFactory = Collection;
  }

  new( defaults ) {
    return this.cast( defaults );
  }

  cast( value, options ) {
    if ( value === undefined || value === null ) {
      value = {};
    }
    var view;
    if ( value.$schema === this ) {
      return value;
    } else if ( value instanceof View ) {
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
    var model = this.modelFactory( this, view, options );
    this.addPaths( model );
    model.init();
    return model;
  }

  /**
   * @param {Model} model
   */
  addPaths( model ) {
    var self = this;
    this.paths.forEach( function( path ) {
      if (
        path.type.type instanceof CollectionSchema &&
        path.type.type.type.type instanceof ModelSchema
      ) {
        self.addCollectionPath( model, path );
      } else {
        self.addAttributePath( model, path );
      }
    });
  }

  /**
   * @param {Model} model
   * @param {SchemaPath} path
   */
  addCollectionPath( model, path ) {
    var collection = this.collectionFactory( model, path.name, path.type.type.type.type );
    pathy( path.name ).override( model, {
      get: function() {
        return collection;
      }
    });
  }

  /**
   * @param {Model} model
   * @param {SchemaPath} path
   */
  addAttributePath( model, path ) {
    pathy( path.name ).override( model, {
      initialize: false,
      get: function() {
        return path.type.cast( model.$view.get( path.name ), {
          parent: model
        });
      },
      set: function( value ) {
        model.$view.set(
          path.name,
          path.type.cast( value, {
            parent: model
          })
        );
      }
    });
  }
}
