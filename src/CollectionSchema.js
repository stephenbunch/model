import { typeOf } from './util';
import ValidationError from './ValidationError';

export default class CollectionSchema {
  constructor( type ) {
    this.type = type;
  }

  cast( value, options ) {
    if ( value === undefined ) {
      value = null;
    }
    if ( typeOf( value ) === 'array' ) {
      var type = this.type;
      return value.map( function( item ) {
        return type.cast( item, options );
      });
    } else {
      return [];
    }
  }

  validate( value ) {
    if ( typeOf( value ) !== 'array' ) {
      throw new ValidationError( 'Value must be an array.' );
    }
    var type = this.type;
    value.forEach( function( item, index ) {
      try {
        type.validate( item );
      } catch ( err ) {
        throw new ValidationError( 'The item at index ' + index + ' is invalid.', err );
      }
    });
  }
}
