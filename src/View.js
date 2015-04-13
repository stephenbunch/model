exports.View = View;

function View( view ) {
  this.view = view;
  this._local = {};
  this.reset();
}

View.prototype.get = function( path ) {
  var value = pathy( path ).get( this._local.value );
  if ( value === undefined && this.view ) {
    return this.view.get( path );
  } else {
    return value;
  }
};

View.prototype.set = function( path, value ) {
  pathy( path ).set( this._local.value, value );
};

View.prototype.reset = function() {
  // We'll store actual value as a sub-property so that observers can listen
  // for changes even if the entire object gets replaced.
  this._local.value = {};
};

View.prototype.merge = function( object ) {
  merge( this._local.value, object );
};

View.prototype.replace = function( object ) {
  this._local.value = object || {};
};

View.prototype.commit = function() {
  if ( !this.view ) {
    throw new Error( 'No subview to commit to!' );
  }
  this.view.merge( this._local.value );
  this.reset();
};

View.prototype.toJSON = function() {
  return merge(
    cloneDeep( this._local.value ),
    this.view && this.view.toJSON() || {}
  );
};

View.prototype.fork = function() {
  return new View( this );
};

View.prototype.watch = function( path, listener ) {
  if ( this.view ) {
    this.view.watch( path, listener );
  }
  pathy( path ).watch( this._local.value, listener );
};
