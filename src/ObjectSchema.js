import ValidationError from './ValidationError';

export default function ObjectSchema( paths ) {
  if ( !( this instanceof ObjectSchema ) ) {
    return new ObjectSchema( paths );
  }

  this.paths = paths;
}

ObjectSchema.prototype.cast = function( value ) {
  if ( value === undefined ) {
    value = null;
  }
  return this.paths.reduce( function( object, path ) {
    path.set( object, path.type.cast( path.get( value ) ) );
    return object;
  }, {} );
};

ObjectSchema.prototype.validate = function( value ) {
  this.paths.forEach( function( path ) {
    try {
      path.type.validate( path.get( value ) );
    } catch ( err ) {
      throw new ValidationError( 'The value at ' + path.name + ' is invalid.' );
    }
  });
};
