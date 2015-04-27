export default class Model {
  /**
   * @param {ModelSchema} schema
   * @param {View} view
   */
  constructor( schema, view ) {
    this.$schema = schema;
    this.$view = view;
  }

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
