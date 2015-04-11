describe( 'Schema', function() {
  describe( 'Schema( object )', function() {
    it( 'should parse the object into an array of paths', function() {
      var schema = new model.Schema({
        foo: Number,
        bar: String
      });
      expect( schema.paths.length ).to.equal( 2 );
      expect( schema.paths[0].name ).to.equal( 'foo' );
      expect( schema.paths[0].type.caster ).to.equal( Number );
      expect( schema.paths[1].name ).to.equal( 'bar' );
      expect( schema.paths[1].type.caster ).to.equal( String );
    });

    it( 'should parse empty arrays as collections of objects', function() {
      var schema = new model.Schema( [] );
      expect( schema ).to.be.instanceof( model.CollectionSchema );
      expect( schema.type ).to.equal( Object );
    });

    it( 'should parse nested objects', function() {
      var schema = new model.Schema({
        foo: {
          bar: Number,
          baz: String
        }
      });
      expect( schema.paths.length ).to.equal( 2 );
      expect( schema.paths[0].name ).to.equal( 'foo.bar' );
      expect( schema.paths[0].type.caster ).to.equal( Number );
      expect( schema.paths[1].name ).to.equal( 'foo.baz' );
      expect( schema.paths[1].type.caster ).to.equal( String );
    });

    it( 'should parse nested arrays as collections of collections', function() {
      var schema = new model.Schema({
        foo: [ [ Number ] ]
      });
      expect( schema.paths.length ).to.equal( 1 );
      var foo = schema.paths[0];
      expect( foo.name ).to.equal( 'foo' );
      expect( foo.type ).to.be.instanceof( model.CollectionSchema );
      expect( foo.type.type ).to.be.instanceof( model.CollectionSchema );
      expect( foo.type.type.type.caster ).to.equal( Number );
    });
  });

  describe( '.cast( value )', function() {
    it( 'should use the schema definition to cast the value', function() {
      var schema = new model.Schema({
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
  });
});
