import Path from '@stephenbunch/path';

export default class ObjectView {
  constructor( object ) {
    this._object = {
      value: object
    };
  }

  get( path ) {
    return Path( path ).get( this._object.value );
  }

  set( path, value ) {
    Path( path ).set( this._object.value, value );
  }

  merge( object ) {
    orm.util.merge( this._object.value, object );
  }

  watch( path, listener ) {
    Path( 'value.' + path ).watch( this._object, listener );
  }

  unwatch( path, listener ) {
    Path( 'value.' + path ).unwatch( this._object, listener );
  }

  toJSON() {
    return JSON.parse( JSON.stringify( this._object.value ) );
  }
};
