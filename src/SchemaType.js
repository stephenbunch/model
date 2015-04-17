export default function SchemaType( caster ) {
  this.cast = caster;
}

SchemaType.prototype.validate = function() {};
