import ModelInspector from './ModelInspector';

export default class ModelEditor {
  constructor() {
    this.inspector = new ModelInspector();
  }

  /**
   * @param {Model} model
   */
  commit( model ) {
    this.inspector.viewForModel( model ).commit();
  }

  /**
   * @param {Model} model
   * @returns {Model}
   */
  edit( model ) {
    var fork = this.inspector.viewForModel( model ).fork();
    return this.inspector.schemaForModel( model ).cast( fork, {
      parent: this.inspector.parentOfModel( model ),
      parentCollection: this.inspector.parentCollectionOfModel( model )
    });
  }

  /**
   * @param {Model} model
   */
  reset( model ) {
    this.inspector.viewForModel( model ).reset();
  }
};
