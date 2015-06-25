import { findIndex } from './util';
import ModelInspector from './ModelInspector';

// Unfortunately, Object.create( Array.prototype ) is broken in ES5, and ES6
// currently enforces the 'new' keyword, so it's impossible to create a factory
// for an Array type using ES6 classes. We'll need to define this class the old
// way.

/**
 * @param {Model} parent
 * @param {String} key
 * @param {ModelSchema} schema
 */
export default function Collection( parent, key, schema ) {
  if ( !( this instanceof Collection ) ) {
    return new Collection( parent, key, schema );
  }

  this._parent = parent;
  this._key = key;
  this._schema = schema;

  this._parentInspector = new ModelInspector();
  this._childInspector = new ModelInspector();

  this._parentInspector.viewForModel( this._parent ).watch(
    this._key,
    this._didChange.bind( this )
  );
  this._didChange();
}

Collection.prototype = [];
Collection.prototype.constructor = Collection;

Collection.prototype.add = function( item ) {
  if ( this.indexOf( item ) === -1 ) {
    this.remove( item );
    item = this._cast( item );
    this.push( item );
    this._apply();
  }
  return item;
};

Collection.prototype.remove = function( item ) {
  var index = this.indexOf( item );
  if ( index === -1 ) {
    index = findIndex( this, function( model ) {
      return model.equals( item );
    });
  }
  if ( index > -1 ) {
    this.splice( index, 1 );
    this._apply();
  }
};

Collection.prototype.new = function( defaults ) {
  return this._cast( defaults );
};

Collection.prototype.addNew = function( defaults ) {
  return this.add( this.new( defaults ) );
};

Collection.prototype.clear = function() {
  this.length = 0;
  this._apply();
};

Collection.prototype.toJSON = function() {
  return this.map( x => x.toJSON() );
};

Collection.prototype._didChange = function() {
  if ( !this._updating ) {
    this.length = 0;
    let parentView = this._parentInspector.viewForModel( this._parent );
    let items = parentView.get( this._key ) || [];
    items.forEach( item => {
      this.push( this._cast( item ) );
    });
  }
};

Collection.prototype._apply = function() {
  this._updating = true;
  this._parentInspector.viewForModel( this._parent ).set(
    this._key,
    this.map( x => this._childInspector.viewForModel( x ) )
  );
  this._updating = false;
};

Collection.prototype._cast = function( value ) {
  return this._schema.cast( value, {
    parent: this._parent,
    parentCollection: this
  });
};
