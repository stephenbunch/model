/**
 * @implements {Schema}
 */
export default class ValueSchema {
  /**
   * @param {Schema|Function} type
   */
  constructor( type ) {
    if ( type && typeof type.cast === 'function' ) {
      this.valueType = type;
    } else {
      this.valueType = {
        cast: type
      };
    }
  }

  cast( value, options ) {
    if ( value === undefined ) {
      value = null;
    }
    return this.valueType.cast( value, options );
  }
};
