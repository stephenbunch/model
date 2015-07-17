import Path from '@stephenbunch/path';
import { merge } from './util';

const _view = Symbol( '_view' );
const _local = Symbol( '_local' );

export default class View {
  /**
   * @param {AbstractView} view
   */
  constructor( view ) {
    this[ _view ] = view;
    this[ _local ] = {};
  }

  /**
   * @param {String} path
   * @returns {*}
   */
  get( path ) {
    var value = Path( path ).get( this[ _local ] );
    if ( value === undefined && this[ _view ] ) {
      return this[ _view ].get( path );
    } else {
      return value;
    }
  }

  /**
   * @param {String} path
   * @param {*} value
   */
  set( path, value ) {
    Path( path ).set( this[ _local ], value );
  }

  /**
   * @param {Object} object
   */
  merge( object ) {
    merge( this[ _local ], object );
  }

  /**
   * @param {Object} object
   */
  replace( object ) {
    if ( !object || Object.getPrototypeOf( object ) !== Object.prototype ) {
      throw new Error( 'Object must be a plain object.' );
    }
    this[ _local ] = object;
  }

  commit() {
    if ( !this[ _view ] ) {
      throw new Error( 'No parent view to commit to!' );
    }
    this[ _view ].merge( this[ _local ] );
    this.replace( {} );
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    return merge(
      this[ _view ] && this[ _view ].toJSON() || {},
      JSON.parse( JSON.stringify( this[ _local ] ) )
    );
  }

  /**
   * @returns {View}
   */
  fork() {
    return new this.constructor( this );
  }
}
