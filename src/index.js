import CollectionSchema from './CollectionSchema';
import Model from './Model';
import ModelCollection from './ModelCollection';
import ModelDecorator from './ModelDecorator';
import ModelEditor from './ModelEditor';
import ModelInspector from './ModelInspector';
import ObjectSchema from './ObjectSchema';
import SchemaParser from './SchemaParser';
import SchemaPath from './SchemaPath';
import Symbol from './Symbol';
import Type from './Type';
import {
  cloneDeep,
  factoryFromClass,
  merge
} from './util';
import ValueSchema from './ValueSchema';
import View from './View';

export default {
  CollectionSchema,
  Model,
  ModelCollection,
  ModelDecorator,
  ModelEditor,
  ModelInspector,
  ObjectSchema,
  SchemaParser,
  SchemaPath,
  Symbol,
  Type,
  util: {
    cloneDeep,
    factoryFromClass,
    merge
  },
  ValueSchema,
  View
};
