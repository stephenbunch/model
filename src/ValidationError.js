export default class ValidationError extends Error {
  constructor( message, error ) {
    super( message );
    this.name = 'ValidationError';
    this.error = error || null;
  }
}
