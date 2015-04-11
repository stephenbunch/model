exports.View = View;

function View( view ) {
  this.view = view;
  this.reset();
}

View.prototype.get = function( path ) {
  var value = pathy( path ).get( this._local );
  if ( value === undefined && this.view ) {
    return this.view.get( path );
  } else {
    return value;
  }
};

View.prototype.set = function( path, value ) {
  pathy( path ).set( this._local, value );
};

View.prototype.reset = function() {
  this._local = {};
};

View.prototype.merge = function( object ) {
  merge( this._local, object );
};

View.prototype.commit = function() {
  if ( !this.view ) {
    throw new Error( 'No subview to commit to!' );
  }
  this.view.merge( this._local );
  this.reset();
};

View.prototype.toJSON = function() {
  return merge(
    cloneDeep( this._local ),
    this.view && this.view.toJSON() || {}
  );
};
