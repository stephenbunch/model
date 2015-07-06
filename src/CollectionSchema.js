import { typeOf } from './util';

export default class CollectionSchema {
  constructor( type ) {
    this.type = type;
  }

  cast( value, options ) {
    if ( value === undefined ) {
      value = null;
    }
    if ( typeOf( value ) === 'array' ) {
      return value.map( item => {
        return this.type.cast( item, options );
      });
    } else {
      return [];
    }
  }
};
