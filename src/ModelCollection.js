import ArrayCollectionAdapter from './ArrayCollectionAdapter';
import ModelInspector from './ModelInspector';
import { findIndex } from './util';

const _parent = Symbol( '_parent' );
const _key = Symbol( '_key' );
const _schema = Symbol( '_schema' );
const _inspector = Symbol( '_inspector' );
const _view = Symbol( '_view' );
const _cast = Symbol( '_cast' );
const _update = Symbol( '_update' );

export default class ModelCollection {
  /**
   * @param {Model} parent
   * @param {String} key
   * @param {ModelSchema} schema
   */
  constructor( parent, key, schema ) {
    this[ _parent ] = parent;
    this[ _key ] = key;
    this[ _schema ] = schema;
    this[ _inspector ] = new ModelInspector();
    this._adapter = new ArrayCollectionAdapter();
  }

  get [ _view ]() {
    return this[ _inspector ].viewForModel( this[ _parent ] );
  }

  get size() {
    return this._adapter.getSize( this[ _view ], this[ _key ] );
  }

  [ Symbol.iterator ]() {
    var iterator = this._adapter.iterate( this[ _view ], this[ _key ] );
    return {
      next: () => {
        var result = iterator.next();
        if ( !result.done ) {
          result.value = this[ _cast ]( result.value );
        }
        return result;
      }
    };
  }

  get( index ) {
    var item = this._adapter
      .valueAtIndex( this[ _view ], this[ _key ], index );
    return item && this[ _cast ]( item );
  }

  set( index, item ) {
    item = this[ _cast ]( item );
    this[ _update ]( items => {
      items[ index ] = item;
    });
  }

  create( defaults ) {
    return this[ _cast ]( defaults );
  }

  push( item ) {
    item = this[ _cast ]( item );
    this[ _update ]( items => items.concat([ item ]) );
    return item;
  }

  remove( item ) {
    var index = this.indexOf( item );
    if ( index > -1 ) {
      this[ _update ]( items => {
        items.splice( index, 1 );
      });
    }
  }

  clear() {
    this[ _update ]( items => [] );
  }

  indexOf( item ) {
    item = this[ _cast ]( item );
    var index = findIndex( this.toArray(), model => {
      return (
        this[ _schema ].keyForEntity( model ) ===
        this[ _schema ].keyForEntity( item )
      );
    });
    return index;
  }

  toArray() {
    var array = [];
    var iterator = this._adapter.iterate( this[ _view ], this[ _key ] );
    while ( true ) {
      let item = iterator.next();
      if ( item.done ) {
        break;
      }
      array.push( this[ _cast ]( item.value ) );
    }
    return array;
  }

  toJSON() {
    return this.toArray().map( x => x.toJSON() );
  }

  [ _cast ]( value ) {
    return this[ _schema ].cast( value, {
      parent: this[ _parent ],
      parentCollection: this
    });
  }

  [ _update ]( map ) {
    var items = this.toArray();
    items = map( items ) || items;
    items = items.map( x => this[ _inspector ].viewForModel( x ) );
    this._adapter.set( this[ _view ], this[ _key ], items );
  }
};
