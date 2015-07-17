/**
 * @implements {Schema}
 */
export default class CollectionSchema {
  /**
   * @param {Schema} type
   */
  constructor( type ) {
    this.collectionType = type;
  }

  cast( value, options ) {
    if ( value === undefined ) {
      value = null;
    }
    if ( Array.isArray( value ) ) {
      return value.map( item => {
        return this.collectionType.cast( item, options );
      });
    } else {
      return [];
    }
  }
};
