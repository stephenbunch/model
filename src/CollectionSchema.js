exports.CollectionSchema = CollectionSchema;

function CollectionSchema( type, options ) {
  this.type = type;
  this.options = options || {};
}

CollectionSchema.prototype.cast = function( value ) {
  if ( value === undefined ) {
    value = null;
  }
  if ( this.options.optional ) {
    if ( value === null ) {
      return null;
    }
  }
  var self = this;
  if ( typeOf( value ) === 'array' ) {
    return value.map( function( item ) {
      return self.type.cast( item );
    });
  } else {
    return [];
  }
};

CollectionSchema.prototype.validate = function( value ) {
  if ( value === null || value === undefined ) {
    if ( this.options.optional ) {
      return;
    } else {
      throw new ValidationError( 'Value cannot be null.' );
    }
  }
  if ( typeOf( value ) !== 'array' ) {
    throw new ValidationError( 'Value must be an array.' );
  }
  var self = this;
  value.forEach( function( item, index ) {
    try {
      self.validate( item );
    } catch ( err ) {
      throw new ValidationError( 'The item at index ' + index + ' is invalid.', err );
    }
  });
};
