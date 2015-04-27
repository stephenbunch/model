describe( 'ModelSchema', function() {
  describe( '.constructor( paths, ModelClass )', function() {
    it( 'can specify a model class', function() {
      class Foo extends model.Model {
        baz() {
          return this.bar;
        }
      }
      var FooSchema = model.Schema({
        bar: Number
      }, Foo );
      var foo = FooSchema.new();
      expect( foo ).to.be.instanceof( Foo );
      expect( foo.baz() ).to.equal( 0 );
    });
  });


  describe( '.new()', function() {
    it( 'should cast members as the specified type', function() {
      var Foo = model.Schema({
        bar: Number
      });
      var foo = Foo.new();
      foo.bar = '3';
      expect( foo.bar ).to.equal( 3 );
    });

    it( 'should treat arrays as collections', function() {
      var Tree = model.Schema({
        leaves: Number
      });
      var Orchard = model.Schema({
        trees: [ Tree ]
      });
      var orchard = Orchard.new();
      expect( orchard.trees ).to.be.instanceof( model.Collection );
      var tree = orchard.trees.addNew();
      expect( tree ).to.be.instanceof( model.Model );
      expect( tree.leaves ).to.equal( 0 );
      expect( orchard.trees.length ).to.equal( 1 );
    });
  });
});
