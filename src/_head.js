( function() {

'use strict';

var isBrowser = !( typeof module !== 'undefined' && module.exports );
var pathy = isBrowser ? window.pathy : require( 'pathy' );

var exports = ( function() {
var exports = {};

var basicSchemaParser = new SchemaParser();

exports.Schema = function( node ) {
  return basicSchemaParser.parse( node );
};
