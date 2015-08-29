import Symbol from '../Symbol';

export default function( type ) {
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
};
