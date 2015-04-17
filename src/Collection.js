import { bind, findIndex } from './util';

/**
 * @param {Model} view
 * @param {String} key
 * @param {ModelSchema} schema
 */
export default function Collection( parent, key, schema ) {
  this.$parent = parent;
  this.$key = key;
  this.$schema = schema;

  this.$parent.$view.watch( this.$key, bind( this._didChange, this ) );
  this._didChange();
}

Collection.prototype = Object.create( Array.prototype );
Collection.prototype.constructor = Collection;

Collection.prototype.add = function( item ) {
  if ( this.indexOf( item ) === -1 ) {
    this.remove( item );
    item = this.$schema.cast( item );
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
  return this.$schema.new( defaults );
};

Collection.prototype.addNew = function( defaults ) {
  return this.add( this.new( defaults ) );
};

Collection.prototype.clear = function() {
  this.length = 0;
  this._apply();
};

Collection.prototype.toJSON = function() {
  return this.map( function( item ) {
    return item.toJSON();
  });
};

Collection.prototype._didChange = function() {
  var self = this;
  if ( !this._updating ) {
    this.length = 0;
    ( this.$parent.$view.get( this.$key ) || [] ).forEach( function( item ) {
      self.push( self.$schema.cast( item ) );
    });
  }
};

Collection.prototype._apply = function() {
  this._updating = true;
  this.$parent.$view.set(
    this.$key,
    this.map( function( item ) {
      return item.$view;
    })
  );
  this._updating = false;
};
