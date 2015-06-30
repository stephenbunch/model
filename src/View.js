import $path from '@stephenbunch/path';
import { merge, cloneDeep } from './util';

/**
 * @name AbstractView.get
 * @function
 * @param {String} path
 * @returns {*}
 */

/**
 * @name AbstractView.merge
 * @function
 * @param {Object} object
 */

/**
 * @name AbstractView.toJSON
 * @function
 * @returns {Object}
 */

/**
 * @name AbstractView.watch
 * @function
 * @param {String} path
 * @param {Function} listener
 */

/**
 * @name AbstractView.unwatch
 * @function
 * @param {String} path
 * @param {Function} listener
 */

/**
 * @typedef {Object} AbstractView
 * @property {AbstractView.get} get
 * @property {AbstractView.merge} merge
 * @property {AbstractView.toJSON} toJSON
 * @property {AbstractView.watch} watch
 * @property {AbstractView.unwatch} unwatch
 */

export default class View {
  /**
   * @param {AbstractView} view
   */
  constructor( view ) {
    this._view = view;
    this._local = {};
    this.reset();
  }

  /**
   * @param {String} path
   * @returns {*}
   */
  get( path ) {
    var value = $path( path ).get( this._local.value );
    if ( value === undefined && this._view ) {
      return this._view.get( path );
    } else {
      return value;
    }
  }

  /**
   * @param {String} path
   * @param {*} value
   */
  set( path, value ) {
    $path( path ).set( this._local.value, value );
  }

  reset() {
    // We'll store the actual value as a sub-property so that observers can
    // listen for changes even if the entire object gets replaced.
    this._local.value = {};
  }

  /**
   * @param {Object} object
   */
  merge( object ) {
    merge( this._local.value, object );
  }

  /**
   * @param {Object} object
   */
  replace( object ) {
    this._local.value = object || {};
  }

  commit() {
    if ( !this._view ) {
      throw new Error( 'No subview to commit to!' );
    }
    this._view.merge( this._local.value );
    this.reset();
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    return merge(
      cloneDeep( this._local.value ),
      this._view && this._view.toJSON() || {}
    );
  }

  /**
   * @returns {View}
   */
  fork() {
    return new View( this );
  }

  /**
   * @param {String} path
   * @param {Function} listener
   */
  watch( path, listener ) {
    if ( this._view ) {
      this._view.watch( path, listener );
    }
    $path( 'value.' + path ).watch( this._local, listener );
  }

  /**
   * @param {String} path
   * @param {Function} listener
   */
  unwatch( path, listener ) {
    if ( this._view ) {
      this._view.unwatch( path, listener );
    }
    $path( 'value.' + path ).unwatch( this._local, listener );
  }
}
