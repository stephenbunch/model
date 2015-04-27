import SchemaParser from './SchemaParser';
import ModelSchema from './ModelSchema';

var modelSchemaParser = new SchemaParser();
modelSchemaParser.typeMatchers.push( function( node ) {
  return node instanceof ModelSchema;
});

export function Schema( node, ModelClass ) {
  return new ModelSchema( modelSchemaParser.schemaFromNode( node ).paths, ModelClass );
}

export { default as Collection } from './Collection';
export { default as CollectionSchema } from './CollectionSchema';
export { default as Model } from './Model';
export { default as ModelSchema } from './ModelSchema';
export { default as ObjectSchema } from './ObjectSchema';
export { default as SchemaParser } from './SchemaParser';
export { default as SchemaPath } from './SchemaPath';
export { default as ValidationError } from './ValidationError';
export { default as ValueSchema, Any } from './ValueSchema';
export { default as View } from './View';

import { merge, cloneDeep } from './util';
export var util = {
  merge: merge,
  cloneDeep: cloneDeep
};
