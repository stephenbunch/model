export default class ObjectSchema {
  constructor( paths ) {
    this.paths = paths;
  }

  cast( value, options ) {
    if ( value === undefined ) {
      value = null;
    }
    return this.paths.reduce( function( object, path ) {
      path.set( object, path.type.cast( path.get( value ), options ) );
      return object;
    }, {} );
  }
}
