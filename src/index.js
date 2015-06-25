import Model from './Model';
import ModelDecorator from './ModelDecorator';
import Collection from './Collection';
import CollectionSchema from './CollectionSchema';
import ObjectSchema from './ObjectSchema';
import SchemaParser from './SchemaParser';
import SchemaPath from './SchemaPath';
import ValidationError from './ValidationError';
import ValueSchema from './ValueSchema';
import { Any } from './ValueSchema';
import View from './View';
import { merge, cloneDeep } from './util';

export default {
  Model: Model,
  ModelDecorator: ModelDecorator,
  Collection: Collection,
  CollectionSchema: CollectionSchema,
  ObjectSchema: ObjectSchema,
  SchemaParser: SchemaParser,
  SchemaPath: SchemaPath,
  ValidationError: ValidationError,
  ValueSchema: ValueSchema,
  Any: Any,
  View: View,
  util: {
    merge: merge,
    cloneDeep: cloneDeep
  }
};
