import SchemaType from './SchemaType';
import ValidationError from './ValidationError';

export function Any( value ) {
  return value;
}

export default class ValueSchema {
  /**
   * @param {SchemaType|Function} type
   * @param {Object} [options]
   */
  constructor( type, options ) {
    this.options = options || {};

    if ( typeof type === 'function' ) {
      if ( type === Any ) {
        this.options.optional = true;
      }
      this.type = new SchemaType( type );
    } else {
      this.type = type;
    }

    this.validators = [];
    this.validators.push( function( value ) {
      if ( value === null || value === undefined ) {
        if ( this.options.optional ) {
          return true;
        } else {
          throw new ValidationError( 'Value cannot be null.' );
        }
      }
    });
  }

  cast( value ) {
    if ( value === undefined ) {
      value = null;
    }
    if ( this.options.optional ) {
      if ( value === null ) {
        return null;
      }
    }
    return this.type.cast( value );
  }

  validate( value ) {
    for ( var i = 0, len = this.validators.length; i < len; i++ ) {
      if ( this.validators[ i ].call( this, value ) === true ) {
        return;
      }
    }
    this.type.validate( value );
  }
}
