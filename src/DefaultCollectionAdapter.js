/**
 * @implements {CollectionAdapter}
 */
export default class DefaultCollectionAdapter {
  /**
   * @param {AbstractView} view
   * @param {String} path
   * @returns {Number}
   */
  getSize( view, path ) {
    return ( view.get( path ) || [] ).length;
  }

  /**
   * @param {AbstractView} view
   * @param {String} path
   * @param {Array} value
   */
  set( view, path, value ) {
    view.set( path, value );
  }

  /**
   * @param {AbstractView} view
   * @param {String} path
   * @returns {Iterator}
   */
  iterate( view, path ) {
    return ( view.get( path ) || [] )[ Symbol.iterator ]();
  }

  /**
   * @param {AbstractView} view
   * @param {String} path
   * @param {Number} index
   * @returns {*}
   */
  valueAtIndex( view, path, index ) {
    return ( view.get( path ) || [] )[ index ];
  }
};
