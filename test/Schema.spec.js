import orm from '../src';

describe( 'Schema', function() {
  describe( '.cast( value )', function() {
    it( 'should use the schema definition to cast the value', function() {
      var parser = new orm.SchemaParser();
      var schema = parser.schemaFromNode({
        foo: {
          bar: Number
        }
      });
      var obj = schema.cast();
      expect( obj ).to.eql({
        foo: {
          bar: 0
        }
      });
    });

    it( 'should create empty arrays', function() {
      var parser = new orm.SchemaParser();
      var schema = parser.schemaFromNode({
        foo: [ [ Number ] ]
      });
      var obj = schema.cast();
      expect( obj ).to.eql({
        foo: []
      });

      obj = schema.cast({
        foo: [ [ '2' ] ]
      });
      expect( obj ).to.eql({
        foo: [ [ 2 ] ]
      });
    });

    it( 'should leave nulls as null when type is nullable', function() {
      var parser = new orm.SchemaParser();
      var schema = parser.schemaFromNode({
        foo: orm.Type.nullable([
          [{
            bar: Number
          }]
        ])
      });
      var obj = schema.cast();
      expect( obj ).to.eql({
        foo: null
      });
      obj = schema.cast({
        foo: [
          [{
            bar: '2'
          }]
        ]
      });
      expect( obj ).to.eql({
        foo: [
          [{
            bar: 2
          }]
        ]
      });
    });

    it( 'should convert null to the default value', function() {
      var parser = new orm.SchemaParser();
      var schema = parser.schemaFromNode({
        foo: [ [ Number ] ]
      });
      var obj = schema.cast({
        foo: [ null ]
      });
      expect( obj ).to.eql({
        foo: [ [] ]
      });
    });

    it( 'should recursively call .cast() on nested schemas', function() {
      var parser = new orm.SchemaParser();
      var schemaA = parser.schemaFromNode({
        foo: Number
      });
      var schemaB = parser.schemaFromNode({
        bar: {
          baz: schemaA
        }
      });
      var obj = schemaB.cast();
      expect( obj ).to.eql({
        bar: {
          baz: {
            foo: 0
          }
        }
      });
    });

    it( 'should not cast Type.any', function() {
      var parser = new orm.SchemaParser();
      var Foo = parser.schemaFromNode({
        bar: null
      });
      var foo = Foo.cast( {} );
      expect( foo.bar ).to.be.null;
      foo.bar = 2;
      expect( foo.bar ).to.equal( 2 );
      foo.bar = '2';
      expect( foo.bar ).to.equal( '2' );
      foo.bar = null;
      expect( foo.bar ).to.be.null;
    });

    it( 'should cast falsey types to empty strings', function() {
      var parser = new orm.SchemaParser();
      var Foo = parser.schemaFromNode({
        bar: String,
        baz: String,
        qux: String
      });
      [ 0, null, false, undefined ].forEach( function( falsey ) {
        var foo = Foo.cast({ bar: falsey });
        expect( foo.bar ).to.equal( '' );
      });
    });

    it( 'should cast to 0 instead of NaN', function() {
      var parser = new orm.SchemaParser();
      var Foo = parser.schemaFromNode({
        bar: Number
      });
      var foo = Foo.cast({ bar: 'hello' });
      expect( foo.bar ).to.equal( 0 );
    });
  });
});
