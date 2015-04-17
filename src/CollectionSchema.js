import { typeOf } from './util';
import ValidationError from './ValidationError';

export default function CollectionSchema( type ) {
  if ( !( this instanceof CollectionSchema ) ) {
    return new CollectionSchema( type );
  }

  this.type = type;
}

CollectionSchema.prototype.cast = function( value ) {
  if ( value === undefined ) {
    value = null;
  }
  if ( typeOf( value ) === 'array' ) {
    var type = this.type;
    return value.map( function( item ) {
      return type.cast( item );
    });
  } else {
    return [];
  }
};

CollectionSchema.prototype.validate = function( value ) {
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
};
