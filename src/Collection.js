import { findIndex } from './util';
import ModelInspector from './ModelInspector';

export default class Collection {
  /**
   * @param {Model} parent
   * @param {String} key
   * @param {ModelSchema} schema
   */
  constructor( parent, key, schema ) {
    this._parent = parent;
    this._key = key;
    this._schema = schema;

    this._parentInspector = new ModelInspector();
    this._childInspector = new ModelInspector();
  }

  get _view() {
    return this._parentInspector.viewForModel( this._parent );
  }

  get _items() {
    return this._view.get( this._key ) || [];
  }

  get length() {
    return this._items.length;
  }

  get( index ) {
    var item = this._items[ index ];
    return item && this._cast( item );
  }

  set( index, item ) {
    item = this._cast( item );
    this._update( items => {
      items[ index ] = item;
    });
  }

  new( defaults ) {
    return this._cast( defaults );
  }

  add( item ) {
    item = this._cast( item );
    this._update( items => items.concat([ item ]) );
    return item;
  }

  addNew( defaults ) {
    return this.add( this.new( defaults ) );
  }

  remove( item ) {
    var index = this.indexOf( item );
    if ( index > -1 ) {
      this._update( items => {
        items.splice( index, 1 );
      });
    }
  }

  clear() {
    this._update( items => [] );
  }

  indexOf( item ) {
    item = this._cast( item );
    var index = findIndex( this.toArray(), function( model ) {
      return model.equals( item );
    });
    return index;
  }

  toArray() {
    return this._items.map( x => this._cast( x ) );
  }

  toJSON() {
    return this.toArray().map( x => x.toJSON() );
  }

  _cast( value ) {
    return this._schema.cast( value, {
      parent: this._parent,
      parentCollection: this
    });
  }

  _update( map ) {
    var items = this.toArray();
    items = map( items ) || items;
    items = items.map( x => this._childInspector.viewForModel( x ) );
    this._view.set( this._key, items );
  }
};
