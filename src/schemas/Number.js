export default {
  cast( value ) {
    value = Number( value );
    if ( isNaN( value ) ) {
      return 0;
    }
    return value;
  }
};
