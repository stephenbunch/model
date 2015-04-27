import { bind, findIndex } from './util';

export default class Collection extends Array {
  /**
   * @param {Model} view
   * @param {String} key
   * @param {ModelSchema} schema
   */
  constructor( parent, key, schema ) {
    super();
    this.$parent = parent;
    this.$key = key;
    this.$schema = schema;

    this.$parent.$view.watch( this.$key, bind( this._didChange, this ) );
    this._didChange();
  }

  add( item ) {
    if ( this.indexOf( item ) === -1 ) {
      this.remove( item );
      item = this.$schema.cast( item );
      this.push( item );
      this._apply();
    }
    return item;
  }

  remove( item ) {
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
  }

  new( defaults ) {
    return this.$schema.new( defaults );
  }

  addNew( defaults ) {
    return this.add( this.new( defaults ) );
  }

  clear() {
    this.length = 0;
    this._apply();
  }

  toJSON() {
    return this.map( function( item ) {
      return item.toJSON();
    });
  }

  _didChange() {
    var self = this;
    if ( !this._updating ) {
      this.length = 0;
      ( this.$parent.$view.get( this.$key ) || [] ).forEach( function( item ) {
        self.push( self.$schema.cast( item ) );
      });
    }
  }

  _apply() {
    this._updating = true;
    this.$parent.$view.set(
      this.$key,
      this.map( function( item ) {
        return item.$view;
      })
    );
    this._updating = false;
  }
}
