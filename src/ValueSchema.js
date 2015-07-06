export default class ValueSchema {
  /**
   * @param {Schema|Function} type
   */
  constructor( type ) {
    if ( type && typeof type.cast === 'function' ) {
      this.type = type;
    } else {
      this.type = {
        cast: type
      };
    }
  }

  cast( value, options ) {
    if ( value === undefined ) {
      value = null;
    }
    return this.type.cast( value, options );
  }
};
