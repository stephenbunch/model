import CollectionPathDecorator from './CollectionPathDecorator';
import DefaultCollectionAdapter from './DefaultCollectionAdapter';
import Model from './Model';
import ModelCollection from './ModelCollection';
import ModelDecorator from './ModelDecorator';
import ModelSchema from './ModelSchema';
import ObjectView from './ObjectView';
import SchemaParser from './SchemaParser';
import View from './View';
import { factoryFromClass } from './util';

export default class ModelSchemaFactory {
  constructor() {
    this.schemaParser = new SchemaParser();
    this.schemaParser.nodeResolvers.push( node => {
      if ( node === Model || node && node.prototype instanceof Model ) {
        return this.schemaFromClass( node );
      }
    });
    this.modelCollectionFactory = factoryFromClass( ModelCollection );
    this.viewFactory = value => {
      if ( value instanceof View ) {
        return value;
      } else {
        return new View( new ObjectView( value || {} ) );
      }
    };
    this.collectionAdapter = new DefaultCollectionAdapter();
    this.modelDecoratorFactory = paths => {
      var decorator = new ModelDecorator( paths );
      decorator.pathDecorators.push(
        new CollectionPathDecorator(
          this.modelCollectionFactory,
          this.collectionAdapter
        )
      );
      return decorator;
    };
  }

  /**
   * @param {Function} ModelClass
   * @returns {ModelSchema}
   */
  schemaFromClass( ModelClass ) {
    var schema = this.schemaParser.schemaFromNode( ModelClass.attrs || {} );
    var decorator = this.modelDecoratorFactory( schema.paths );
    return new ModelSchema( ModelClass, decorator, this.viewFactory );
  }
};
