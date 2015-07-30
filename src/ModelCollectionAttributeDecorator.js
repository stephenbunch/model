import CollectionSchema from './CollectionSchema';
import ModelSchema from './ModelSchema';
import Path from '@stephenbunch/path';

export default class ModelCollectionAttributeDecorator {
  /**
   * @param {Function} collectionFactory
   */
  constructor( collectionFactory ) {
    this._collectionFactory = collectionFactory;
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
      path.pathType.valueType.collectionType.valueType
    );
    Path( path.name ).override( model, {
      get: () => {
        return collection;
      }
    });
  }
};
