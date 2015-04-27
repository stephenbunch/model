import pathy from 'pathy';

export default class SchemaPath {
  constructor( path, type ) {
    this.name = path;
    this.type = type;
    this.accessor = pathy( path );
  }

  get( object ) {
    return this.accessor.get( object );
  }

  set( object, value ) {
    this.accessor.set( object, value );
  }
}
