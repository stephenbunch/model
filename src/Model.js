import ModelEditor from './ModelEditor';

const editor = new ModelEditor();

export default class Model {
  static attrs = {}

  static keyForEntity( entity ) {
    throw new Error( `'Model.keyForEntity( entity )' needs to be implemented.` );
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    return editor.inspector.viewForModel( this ).toJSON();
  }
};
