import { typeOf } from './util';

export default class CollectionSchema {
  constructor( type ) {
    this.collectionType = type;
  }

  cast( value, options ) {
    if ( value === undefined ) {
      value = null;
    }
    if ( typeOf( value ) === 'array' ) {
      return value.map( item => {
        return this.collectionType.cast( item, options );
      });
    } else {
      return [];
    }
  }
};
