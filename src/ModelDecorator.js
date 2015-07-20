import ModelInspector from './ModelInspector';
import Path from '@stephenbunch/path';

export default class ModelDecorator {
  /**
   * @param {Array.<SchemaPath>} paths
   */
  constructor( paths ) {
    this._inspector = new ModelInspector();
    this.paths = paths;
    this.decorations = [];
  }

  /**
   * @param {Model} model
   */
  decorate( model ) {
    this.paths.forEach( path => {
      for ( let decoration of this.decorations ) {
        if ( decoration.shouldDecoratePath( path ) ) {
          decoration.decoratePath( path, model );
          return;
        }
      }
      this._addAttributePath( path, model );
    });
  }

  /**
   * @param {SchemaPath} path
   * @param {Model} model
   */
  _addAttributePath( path, model ) {
    Path( path.name ).override( model, {
      initialize: false,
      persist: true,
      get: () => {
        var view = this._inspector.viewForModel( model );
        return path.pathType.cast( view.get( path.name ), {
          parent: model
        });
      },
      set: value => {
        this._inspector.viewForModel( model ).set(
          path.name,
          path.pathType.cast( value, {
            parent: model
          })
        );
      }
    });
  }
};
