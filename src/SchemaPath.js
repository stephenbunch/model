import $path from '@stephenbunch/path';

export default class SchemaPath {
  constructor( path, type ) {
    this.name = path;
    this.type = type;
    this.accessor = $path( path );
  }

  get( object ) {
    return this.accessor.get( object );
  }

  set( object, value ) {
    this.accessor.set( object, value );
  }
};
