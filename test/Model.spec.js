describe( 'model.Schema', function() {
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

  describe( '.edit()', function() {
    it( 'should return a fork', function() {
      var Foo = model.Schema({
        bar: Number
      });
      var main = Foo.new();
      var edit = main.edit();
      main.bar = 2;
      expect( main.bar ).to.equal( 2 );
      expect( edit.bar ).to.equal( 2 );
      edit.bar = 3;
      expect( main.bar ).to.equal( 2 );
      expect( edit.bar ).to.equal( 3 );
      edit.commit();
      expect( main.bar ).to.equal( 3 );
    });

    it( 'should fork collections', function() {
      var Tree = model.Schema({
        id: Number
      });
      var Orchard = model.Schema({
        trees: [ Tree ]
      });
      var main = Orchard.new();
      var edit = main.edit();

      // No changes have been made to 'edit', so when we add an item to main
      // collection, the change is seen in both versions.
      main.trees.addNew({ id: 1 });
      expect( main.trees.length ).to.equal( 1 );
      expect( edit.trees.length ).to.equal( 1 );

      // When we modify the collection in 'edit', the change only doesn't
      // appear in 'main'.
      edit.trees.addNew({ id: 2 });
      expect( edit.trees.length ).to.equal( 2 );
      expect( main.trees.length ).to.equal( 1 );

      // We change the main collection again, but this time, we don't see
      // the change in 'edit' because that version already has pending changes.
      main.trees.addNew({ id: 3 });

      expect( main.trees.length ).to.equal( 2 );
      expect( edit.trees.length ).to.equal( 2 );

      // We still see the same two items in 'edit'.
      expect( edit.trees[0].id ).to.equal( 1 );
      expect( edit.trees[1].id ).to.equal( 2 );

      // We see the first and third item in 'main'.
      expect( main.trees[0].id ).to.equal( 1 );
      expect( main.trees[1].id ).to.equal( 3 );

      // When we commit the fork, the collection is replaced with the new
      // changes.
      edit.commit();

      // Now we see the same items in both versions.
      expect( main.trees.length ).to.equal( 2 );
      expect( edit.trees.length ).to.equal( 2 );

      expect( main.trees[0].id ).to.equal( 1 );
      expect( edit.trees[0].id ).to.equal( 1 );

      expect( main.trees[1].id ).to.equal( 2 );
      expect( edit.trees[1].id ).to.equal( 2 );
    });
  });
});
