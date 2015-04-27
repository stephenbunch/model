describe( 'Model', function() {
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

  describe( '.$parent', function() {
    it( 'should return the parent model', function() {
      var Foo = model.Schema({
        name: String
      });
      var Bar = model.Schema({
        id: String,
        foo: Foo
      });
      var bar = Bar.new();
      expect( bar.foo.$parent ).to.equal( bar );
    });

    it( 'should return the parent of the parent collection', function() {
      var Foo = model.Schema();
      var Bar = model.Schema({
        foos: [ Foo ]
      });
      var bar = Bar.new();
      bar.foos.addNew();
      expect( bar.foos[0].$parent ).to.equal( bar );
    });
  });

  describe( '.$parentCollection', function() {
    it( 'should return the parent collection', function() {
      var Foo = model.Schema();
      var Bar = model.Schema({
        foos: [ Foo ]
      });
      var bar = Bar.new();
      bar.foos.addNew();
      expect( bar.foos[0].$parentCollection ).to.equal( bar.foos );
    });
  });
});
