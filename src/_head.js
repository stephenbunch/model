( function() {

'use strict';

var isBrowser = !( typeof module !== 'undefined' && module.exports );
var pathy = isBrowser ? window.pathy : require( 'pathy' );

var exports = ( function() {
var exports = {};

var basicSchemaParser = new SchemaParser();
var modelSchemaParser = new SchemaParser();
modelSchemaParser.typeMatchers.push( function( node ) {
  return node instanceof ModelSchema;
});

exports.Type = function( node ) {
  return basicSchemaParser.parse( node );
};

exports.Schema = function( node, options ) {
  return new ModelSchema( modelSchemaParser.parse( node ).paths, options );
};
