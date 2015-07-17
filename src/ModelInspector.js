const _view = Symbol();
const _parent = Symbol();
const _parentCollection = Symbol();
const _schema = Symbol();

export default class ModelInspector {
  viewForModel( model ) {
    return model[ _view ];
  }

  setViewForModel( model, view ) {
    model[ _view ] = view;
  }

  parentOfModel( model ) {
    return model[ _parent ];
  }

  setParentOfModel( model, parent ) {
    model[ _parent ] = parent;
  }

  parentCollectionOfModel( model ) {
    return model[ _parentCollection ];
  }

  setParentCollectionOfModel( model, parentCollection ) {
    model[ _parentCollection ] = parentCollection;
  }

  schemaForModel( model ) {
    return model[ _schema ];
  }

  setSchemaForModel( model, schema ) {
    model[ _schema ] = schema;
  }
};
