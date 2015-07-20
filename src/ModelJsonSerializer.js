export default class ModelJsonSerializer {
  /**
   * @param {Array.<SchemaPath>} paths
   * @param {*} value
   * @returns {Object}
   */
  serialize( paths, value ) {
    return paths.reduce( ( object, path ) => {
      var val = path.get( value );
      if ( val && typeof val.toJSON === 'function' ) {
        val = val.toJSON();
      } else {
        val = path.pathType.cast( val );
      }
      path.set( object, val );
      return object;
    }, {} );
  }
};
