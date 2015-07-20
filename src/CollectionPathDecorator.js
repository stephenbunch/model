import CollectionSchema from './CollectionSchema';
import ModelSchema from './ModelSchema';
import Path from '@stephenbunch/path';

export default class CollectionPathDecorator {
  /**
   * @param {Function} collectionFactory
   * @param {CollectionAdapter} collectionAdapter
   */
  constructor( collectionFactory, collectionAdapter ) {
    this._collectionFactory = collectionFactory;
    this._collectionAdapter = collectionAdapter;
  }

  /**
   * @param {SchemaPath} path
   * @returns {Boolean}
   */
  shouldDecoratePath( path ) {
    return (
      path.pathType.valueType instanceof CollectionSchema &&
      path.pathType.valueType.collectionType.valueType instanceof ModelSchema
    );
  }

  /**
   * @param {SchemaPath} path
   * @param {Model} model
   */
  decoratePath( path, model ) {
    var collection = this._collectionFactory(
      model,
      path.name,
      path.pathType.valueType.collectionType.valueType,
      this._collectionAdapter
    );
    Path( path.name ).override( model, {
      get: () => {
        return collection;
      }
    });
  }
};
