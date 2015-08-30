import Symbol from '../Symbol';

export default function( type ) {
  return {
    [ Symbol.generic ]: true,
    of: [ type ],
    get( schemas ) {
      return {
        cast( value, options ) {
          if ( value === undefined ) {
            value = null;
          }
          if ( Array.isArray( value ) ) {
            return value.map( item => {
              return schemas[0].cast( item, options );
            });
          } else {
            return [];
          }
        }
      };
    }
  };
};
