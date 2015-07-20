import ModelEditor from './ModelEditor';

export default class ModelSchema {
  /**
   * @param {Function} ModelClass
   * @param {ModelDecorator} decorator
   * @param {function(): View} viewFactory
   */
  constructor( ModelClass, decorator, viewFactory ) {
    this._class = ModelClass;
    this._decorator = decorator;
    this._editor = new ModelEditor();
    this._viewFactory = viewFactory;
  }

  get paths() {
    return this._decorator.paths;
  }

  /**
   * Casts an existing value to a new model instance.
   * @param {*} [value]
   * @param {ModelSchemaCastOptions} [options]
   * @returns {Model}
   */
  cast( value, options ) {
    if ( value instanceof this._class ) {
      return value;
    }
    var model = Object.create( this._class.prototype );
    var view = this._viewFactory( value );
    this._editor.inspector.setViewForModel( model, view );
    this._editor.inspector.setSchemaForModel( model, this );
    options = options || {};
    this._editor.inspector.setParentOfModel( model, options.parent );
    this._editor.inspector.setParentCollectionOfModel( model, options.parentCollection );
    this._decorator.decorate( model );
    this._class.prototype.constructor.call( model );
    return model;
  }

  keyForEntity( entity ) {
    this._class.keyForEntity( entity );
  }
};
