/**
 * Creates a factory function that returns a new instance of the specified
 * class.
 * @param {Function} Class
 * @returns {Function}
 */
export default function( Class ) {
  return function() {
    var instance = Object.create( Class.prototype );
    Class.prototype.constructor.apply( instance, arguments );
    return instance;
  };
};
