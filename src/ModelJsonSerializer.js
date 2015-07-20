export default class ModelJsonSerializer {
  /**
   * @param {Array.<SchemaPath>} paths
   * @param {*} value
   * @returns {Object}
   */
  serialize( paths, value ) {
    return paths.reduce( ( object, path ) => {
      var val = path.pathType.cast( path.get( value ) );
      if ( val && typeof val.toJSON === 'function' ) {
        val = val.toJSON();
      }
      path.set( object, val );
      return object;
    }, {} );
  }
};
