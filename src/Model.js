import ModelEditor from './ModelEditor';
import ModelJsonSerializer from './ModelJsonSerializer';

const editor = new ModelEditor();
const serializer = new ModelJsonSerializer();

export default class Model {
  static attrs = {}

  static keyForEntity( entity ) {
    throw new Error( `'Model.keyForEntity( entity )' needs to be implemented.` );
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    var data = editor.inspector.viewForModel( this ).toJSON();
    var schema = editor.inspector.schemaForModel( this );
    return serializer.serialize( schema.paths, data );
  }
};
