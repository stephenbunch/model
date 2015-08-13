import Symbol from './Symbol';

export default {
  any( value ) {
    return value;
  },

  nullable( type ) {
    return {
      [ Symbol.generic ]: true,
      of: [ type ],
      get( schemas ) {
        return {
          cast( value, options ) {
            if ( value === null || value === undefined ) {
              return null;
            }
            return schemas[0].cast( value, options );
          }
        };
      }
    };
  },

  number( value ) {
    value = Number( value );
    if ( isNaN( value ) ) {
      return 0;
    }
    return value;
  },

  string( value ) {
    return String( value || '' );
  }
};
