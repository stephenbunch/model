exports.ValidationError = ValidationError;

function ValidationError( message, error ) {
  this.name = 'ValidationError';
  this.message = message;
  this.error = error || null;
}

ValidationError.prototype = Object.create( Error.prototype );
ValidationError.prototype.constructor = ValidationError;
