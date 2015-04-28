import SchemaType from './SchemaType';
import ValidationError from './ValidationError';

export function Any( value ) {
  return value;
}

export default class ValueSchema {
  static defaultFactory( type, options ) {
    options = options || {};
    if ( type === Any ) {
      options.optional = true;
    } else if ( type === Number ) {
      type = function( value ) {
        value = Number( value );
        if ( isNaN( value ) ) {
          return 0;
        }
        return value;
      };
    } else if ( type === String ) {
      type = function( value ) {
        return String( value || '' );
      };
    }
    return new ValueSchema( type, options );
  }

  /**
   * @param {SchemaType|Function} type
   * @param {Object} [options]
   */
  constructor( type, options ) {
    this.options = options || {};

    if ( typeof type.cast === 'function' ) {
      this.type = type;
    } else {
      this.type = new SchemaType( type );
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

  cast( value, options ) {
    if ( value === undefined ) {
      value = null;
    }
    if ( this.options.optional ) {
      if ( value === null ) {
        return null;
      }
    }
    return this.type.cast( value, options );
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
