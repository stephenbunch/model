exports.ValueSchema = ValueSchema;

function ValueSchema( caster, options ) {
  this.caster = caster;
  this.options = options || {};
}

ValueSchema.prototype.cast = function( value ) {
  if ( value === undefined ) {
    value = null;
  }
  if ( this.options.optional ) {
    if ( value === null ) {
      return null;
    }
  }
  return this.caster( value );
};

ValueSchema.prototype.validate = function( value ) {
  if ( value === null || value === undefined ) {
    if ( this.options.optional ) {
      return;
    } else {
      throw new ValidationError( 'Value cannot be null.' );
    }
  }
};
