export default class Model {
  /**
   * @param {ModelSchema} schema
   * @param {View} view
   * @param {Object} [options]
   */
  constructor( schema, view, options ) {
    this.$schema = schema;
    this.$view = view;

    options = options || {};
    this.$parent = options.parent;
    this.$parentCollection = options.parentCollection;
  }

  init() {}

  edit() {
    return this.$schema.cast( this.$view.fork() );
  }

  commit() {
    this.$view.commit();
  }

  reset() {
    this.$view.reset();
  }

  toJSON() {
    return this.$view.toJSON();
  }

  equals( other ) {
    return other === this;
  }
}
