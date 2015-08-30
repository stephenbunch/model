export default class ValueSchema {
  /**
   * @param {Schema|Function} type
   */
  constructor( type ) {
    this.valueType = type;
  }

  cast( value, options ) {
    if ( value === undefined ) {
      value = null;
    }
    return this.valueType.cast( value, options );
  }
};
