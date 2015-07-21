export default class ModelJsonSerializer {
  /**
   * @param {Array.<SchemaPath>} paths
   * @param {Model} model
   * @returns {Object}
   */
  serialize( paths, model ) {
    return paths.reduce( ( object, path ) => {
      var val = path.get( model );
      if ( val && typeof val.toJSON === 'function' ) {
        val = val.toJSON();
      }
      path.set( object, val );
      return object;
    }, {} );
  }
};
