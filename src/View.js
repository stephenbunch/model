import $path from '@stephenbunch/path';
import { merge, cloneDeep } from './util';

export default class View {
  constructor( view ) {
    this.view = view;
    this._local = {};
    this.reset();
  }

  get( path ) {
    var value = $path( path ).get( this._local.value );
    if ( value === undefined && this.view ) {
      return this.view.get( path );
    } else {
      return value;
    }
  }

  set( path, value ) {
    $path( path ).set( this._local.value, value );
  }

  reset() {
    // We'll store actual value as a sub-property so that observers can listen
    // for changes even if the entire object gets replaced.
    this._local.value = {};
  }

  merge( object ) {
    merge( this._local.value, object );
  }

  replace( object ) {
    this._local.value = object || {};
  }

  commit() {
    if ( !this.view ) {
      throw new Error( 'No subview to commit to!' );
    }
    this.view.merge( this._local.value );
    this.reset();
  }

  toJSON() {
    return merge(
      cloneDeep( this._local.value ),
      this.view && this.view.toJSON() || {}
    );
  }

  fork() {
    return new View( this );
  }

  watch( path, listener ) {
    if ( this.view ) {
      this.view.watch( path, listener );
    }
    $path( path ).watch( this._local.value, listener );
  }
}
