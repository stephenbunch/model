( function() {

'use strict';

var isBrowser = !( typeof module !== 'undefined' && module.exports );
var pathy = isBrowser ? window.pathy : require( 'pathy' );

var exports = ( function() {
var exports = {};

exports.Schema = function( node ) {
  var parser = new SchemaParser( ObjectSchema, CollectionSchema, ValueSchema );
  var _super = parser.isValueNode;
  parser.isValueNode = function( node ) {
    return _super.call( this, node ) || node instanceof ObjectSchema;
  };
  return parser.parse( node );
};
