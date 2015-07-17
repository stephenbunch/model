/**
 * @implements {Schema}
 */
export default class ObjectSchema {
  /**
   * @param {Array.<SchemaPath>} paths
   */
  constructor( paths ) {
    this.paths = paths;
  }

  cast( value, options ) {
    if ( value === undefined ) {
      value = null;
    }
    return this.paths.reduce( function( object, path ) {
      path.set( object, path.pathType.cast( path.get( value ), options ) );
      return object;
    }, {} );
  }
};
