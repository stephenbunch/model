import CollectionSchema from './CollectionSchema';
import Model from './Model';
import ModelCollection from './ModelCollection';
import ModelDecorator from './ModelDecorator';
import ModelEditor from './ModelEditor';
import ModelSchema from './ModelSchema';
import ModelSchemaFactory from './ModelSchemaFactory';
import ModelInspector from './ModelInspector';
import ObjectSchema from './ObjectSchema';
import SchemaParser from './SchemaParser';
import SchemaPath from './SchemaPath';
import Symbol from './Symbol';
import Type from './Type';
import {
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
  ModelSchema,
  ModelSchemaFactory,
  ObjectSchema,
  SchemaParser,
  SchemaPath,
  Symbol,
  Type,
  util: {
    factoryFromClass,
    merge
  },
  ValueSchema,
  View
};
