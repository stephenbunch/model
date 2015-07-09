import orm from '../src';

describe( 'SchemaParser', function() {
  describe( '.schemaFromNode( node )', function() {
    it( 'should parse the object into an array of paths', function() {
      var parser = new orm.SchemaParser();
      var schema = parser.schemaFromNode({
        foo: Number,
        bar: String
      });
      expect( schema.paths.length ).to.equal( 2 );
      expect( schema.paths[0].name ).to.equal( 'foo' );
      expect( schema.paths[0].pathType.valueType.cast ).to.be.a( 'function' );
      expect( schema.paths[1].name ).to.equal( 'bar' );
      expect( schema.paths[1].pathType.valueType.cast ).to.be.a( 'function' );
    });

    it( 'should parse empty arrays as collections of objects', function() {
      var parser = new orm.SchemaParser();
      var schema = parser.schemaFromNode( [] );
      expect( schema.valueType ).to.be.instanceof( orm.CollectionSchema );
      expect( schema.valueType.collectionType.valueType.cast ).to.equal( orm.Type.any );
    });

    it( 'should parse nested objects', function() {
      var parser = new orm.SchemaParser();
      var schema = parser.schemaFromNode({
        foo: {
          bar: Number,
          baz: String
        }
      });
      expect( schema.paths.length ).to.equal( 2 );
      expect( schema.paths[0].name ).to.equal( 'foo.bar' );
      expect( schema.paths[0].pathType.valueType.cast ).to.be.a( 'function' );
      expect( schema.paths[1].name ).to.equal( 'foo.baz' );
      expect( schema.paths[1].pathType.valueType.cast ).to.be.a( 'function' );
    });

    it( 'should parse nested arrays as collections of collections', function() {
      var parser = new orm.SchemaParser();
      var schema = parser.schemaFromNode({
        foo: [ [ Number ] ]
      });
      expect( schema.paths.length ).to.equal( 1 );
      var foo = schema.paths[0];
      expect( foo.name ).to.equal( 'foo' );
      expect( foo.pathType.valueType ).to.be.instanceof( orm.CollectionSchema );
      expect( foo.pathType.valueType.collectionType.valueType ).to.be.instanceof( orm.CollectionSchema );
      expect( foo.pathType.valueType.collectionType.valueType.collectionType.valueType.cast ).to.be.a( 'function' );
    });

    it( 'should parse null or undefined as an object', function() {
      var parser = new orm.SchemaParser();
      var schema = parser.schemaFromNode();
      expect( schema.paths.length ).to.equal( 0 );
      expect( schema.cast() ).to.eql( {} );
    });

    it( 'should use type resolvers', function() {
      var parser = new orm.SchemaParser();
      parser.typeResolvers.set( String, Number );
      var schema = parser.schemaFromNode( String );
      expect( schema.cast( '123' ) ).to.equal( 123 );
      schema = parser.schemaFromNode([ String ]);
      expect( schema.cast([ '123' ]) ).to.eql([ 123 ]);
      schema = parser.schemaFromNode({
        foo: String
      });
      expect( schema.cast() ).to.eql({
        foo: 0
      });
    });
  });
});
