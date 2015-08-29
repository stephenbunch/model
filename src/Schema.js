import SchemaParser from './SchemaParser';

var parser = new SchemaParser();

export default class Schema {
  constructor( objectNode ) {
    this._schema = parser.schemaFromNode( objectNode );
  }

  cast( value, options ) {
    return this._schema.cast( value, options );
  }
};
