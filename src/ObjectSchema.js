import ValidationError from './ValidationError';

export default class ObjectSchema {
  constructor( paths ) {
    this.paths = paths;
  }

  cast( value ) {
    if ( value === undefined ) {
      value = null;
    }
    return this.paths.reduce( function( object, path ) {
      path.set( object, path.type.cast( path.get( value ) ) );
      return object;
    }, {} );
  }

  validate( value ) {
    this.paths.forEach( function( path ) {
      try {
        path.type.validate( path.get( value ) );
      } catch ( err ) {
        throw new ValidationError( 'The value at ' + path.name + ' is invalid.' );
      }
    });
  }
}
