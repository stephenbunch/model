import Path from '@stephenbunch/path';

export default class SchemaPath {
  constructor( path, type ) {
    this.name = path;
    this.type = type;
    this.accessor = Path( path );
  }

  get( object ) {
    return this.accessor.get( object );
  }

  set( object, value ) {
    this.accessor.set( object, value );
  }
};
