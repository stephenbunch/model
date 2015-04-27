describe( 'SchemaParser', function() {

  var parser;
  beforeEach( function() {
    parser = new model.SchemaParser();
  });

  describe( '.schemaFromNode( node )', function() {
    it( 'should parse the object into an array of paths', function() {
      var schema = parser.schemaFromNode({
        foo: Number,
        bar: String
      });
      expect( schema.paths.length ).to.equal( 2 );
      expect( schema.paths[0].name ).to.equal( 'foo' );
      expect( schema.paths[0].type.type.cast ).to.be.a( 'function' );
      expect( schema.paths[1].name ).to.equal( 'bar' );
      expect( schema.paths[1].type.type.cast ).to.be.a( 'function' );
    });

    it( 'should parse empty arrays as collections of objects', function() {
      var schema = parser.schemaFromNode( [] );
      expect( schema.type ).to.be.instanceof( model.CollectionSchema );
      expect( schema.type.type.type.cast ).to.equal( model.Any );
    });

    it( 'should parse nested objects', function() {
      var schema = parser.schemaFromNode({
        foo: {
          bar: Number,
          baz: String
        }
      });
      expect( schema.paths.length ).to.equal( 2 );
      expect( schema.paths[0].name ).to.equal( 'foo.bar' );
      expect( schema.paths[0].type.type.cast ).to.be.a( 'function' );
      expect( schema.paths[1].name ).to.equal( 'foo.baz' );
      expect( schema.paths[1].type.type.cast ).to.be.a( 'function' );
    });

    it( 'should parse nested arrays as collections of collections', function() {
      var schema = parser.schemaFromNode({
        foo: [ [ Number ] ]
      });
      expect( schema.paths.length ).to.equal( 1 );
      var foo = schema.paths[0];
      expect( foo.name ).to.equal( 'foo' );
      expect( foo.type.type ).to.be.instanceof( model.CollectionSchema );
      expect( foo.type.type.type.type ).to.be.instanceof( model.CollectionSchema );
      expect( foo.type.type.type.type.type.type.cast ).to.be.a( 'function' );
    });

    it( 'should parse null or undefined as an object', function() {
      var schema = parser.schemaFromNode();
      expect( schema.paths.length ).to.equal( 0 );
      expect( schema.cast() ).to.eql( {} );
    });
  });

  describe( '[schema].cast( value )', function() {
    it( 'should use the schema definition to cast the value', function() {
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

    it( 'should leave nulls as null when schema is optional', function() {
      var schema = parser.schemaFromNode({
        foo: {
          type: [ [ Number ] ],
          optional: true
        }
      });
      var obj = schema.cast();
      expect( obj ).to.eql({
        foo: null
      });
    });

    it( 'should convert null to the default value', function() {
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

    it( 'should not cast model.Any', function() {
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
      var Foo = parser.schemaFromNode({
        bar: Number
      });
      var foo = Foo.cast({ bar: 'hello' });
      expect( foo.bar ).to.equal( 0 );
    });
  });
});
