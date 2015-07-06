import Collection from './Collection';
import CollectionSchema from './CollectionSchema';
import Model from './Model';
import ModelDecorator from './ModelDecorator';
import ModelEditor from './ModelEditor';
import ModelInspector from './ModelInspector';
import ObjectSchema from './ObjectSchema';
import SchemaParser from './SchemaParser';
import SchemaPath from './SchemaPath';
import Symbol from './Symbol';
import Type from './Type';
import { merge, cloneDeep } from './util';
import ValueSchema from './ValueSchema';
import View from './View';

export default {
  Collection,
  CollectionSchema,
  Model,
  ModelDecorator,
  ModelEditor,
  ModelInspector,
  ObjectSchema,
  SchemaParser,
  SchemaPath,
  Symbol,
  Type,
  util: {
    merge,
    cloneDeep
  },
  ValueSchema,
  View
};
