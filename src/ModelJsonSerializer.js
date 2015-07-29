export default class ModelJsonSerializer {
  /**
   * @param {Array.<SchemaPath>} paths
   * @param {Model} model
   * @returns {Object}
   */
  serialize( paths, model ) {
    var obj = paths.reduce( ( object, path ) => {
      var val = path.get( model );
      if ( val && typeof val.toJSON === 'function' ) {
        val = val.toJSON();
      }
      path.set( object, val );
      return object;
    }, {} );
    for ( let prop in model ) {
      if ( !( prop in obj ) ) {
        let val = model[ prop ];
        if ( val && typeof val.toJSON === 'function' ) {
          val = val.toJSON();
        }
        obj[ prop ] = val;
      }
    }
    return obj;
  }
};
