import Model from './Model';
import ModelDecorator from './ModelDecorator';
import ModelEditor from './ModelEditor';
import ModelInspector from './ModelInspector';
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
  Model,
  ModelDecorator,
  ModelEditor,
  ModelInspector,
  Collection,
  CollectionSchema,
  ObjectSchema,
  SchemaParser,
  SchemaPath,
  ValidationError,
  ValueSchema,
  Any,
  View,
  util: {
    merge,
    cloneDeep
  }
};
