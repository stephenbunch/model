const viewKey = Symbol();
const parentKey = Symbol();
const parentCollectionKey = Symbol();

export default class ModelHelper {
  viewForModel( model ) {
    return model[ viewKey ];
  }

  setViewForModel( model, view ) {
    model[ viewKey ] = view;
  }

  parentOfModel( model ) {
    return model[ parentKey ];
  }

  setParentOfModel( model, parent ) {
    model[ parentKey ] = parent;
  }

  parentCollectionOfModel( model ) {
    return model[ parentCollectionKey ];
  }

  setParentCollectionOfModel( model, parentCollection ) {
    model[ parentCollectionKey ] = parentCollection;
  }
};
