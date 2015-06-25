import ModelInspector from './ModelInspector';

export default class ModelEditor {
  constructor() {
    this.inspector = new ModelInspector();
  }

  commit( model ) {
    this.inspector.viewForModel( model ).commit();
  }

  edit( model ) {
    return model.constructor.cast( this.inspector.viewForModel( model ).fork(), {
      parent: this.inspector.parentOfModel( model ),
      parentCollection: this.inspector.parentCollectionOfModel( model )
    });
  }

  reset( model ) {
    this.inspector.viewForModel( model ).reset();
  }
}
