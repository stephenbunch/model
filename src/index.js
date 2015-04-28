export { default as Base } from './Model';
export { default as ModelDecorator } from './ModelDecorator';
export { default as Collection } from './Collection';
export { default as CollectionSchema } from './CollectionSchema';
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
