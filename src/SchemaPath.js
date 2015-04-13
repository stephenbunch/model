exports.SchemaPath = SchemaPath;

function SchemaPath( path, type ) {
  if ( !( this instanceof SchemaPath ) ) {
    return new SchemaPath( path, type );
  }

  this.name = path;
  this.type = type;
  this.accessor = pathy( path );
}

SchemaPath.prototype.get = function( object ) {
  return this.accessor.get( object );
};

SchemaPath.prototype.set = function( object, value ) {
  this.accessor.set( object, value );
};
