/**
 * @param {ModelSchema} schema
 * @param {View} view
 */
export default function Model( schema, view ) {
  this.$schema = schema;
  this.$view = view;
}

Model.prototype.edit = function() {
  return this.$schema.cast( this.$view.fork() );
};

Model.prototype.commit = function() {
  this.$view.commit();
};

Model.prototype.reset = function() {
  this.$view.reset();
};

Model.prototype.toJSON = function() {
  return this.$view.toJSON();
};

Model.prototype.equals = function( other ) {
  return other === this;
};
