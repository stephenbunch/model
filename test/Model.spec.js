import orm from '../src';

describe( 'Model', function() {
  describe( 'Class', function() {
    it( 'can be extended', function() {
      class Foo extends orm.Model {
        static schema = {
          bar: Number
        }
        baz() {
          return this.bar;
        }
      }
      var foo = new Foo();
      expect( foo ).to.be.instanceof( Foo );
      expect( foo.baz() ).to.equal( 0 );
    });

    it( 'should cast members as the specified type', function() {
      class Foo extends orm.Model {
        static schema = {
          bar: Number
        }
      }
      var foo = new Foo();
      foo.bar = '3';
      expect( foo.bar ).to.equal( 3 );
    });

    it( 'should treat arrays as collections', function() {
      class Tree extends orm.Model {
        static schema = {
          leaves: Number
        }
      }

      class Orchard extends orm.Model {
        static schema = {
          trees: [ Tree ]
        }
      }
      var orchard = new Orchard();
      expect( orchard.trees ).to.be.instanceof( orm.Collection );
      var tree = orchard.trees.addNew();
      expect( tree ).to.be.instanceof( Tree );
      expect( tree.leaves ).to.equal( 0 );
      expect( orchard.trees.length ).to.equal( 1 );
    });
  });

  describe( '::new()', function() {
    it( 'should behave the same way as the `new` operator', function() {
      class Foo extends orm.Model {
        static schema = {
          bar: Number
        }
      };
      var foo = Foo.new();
      expect( foo.bar ).to.equal( 0 );
    });
  });

  describe( '.edit()', function() {
    it( 'should return a fork', function() {
      class Foo extends orm.Model {
        static schema = {
          bar: Number
        }
      }
      var main = new Foo();
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
      class Tree extends orm.Model {
        static schema = {
          id: Number
        }
      }
      class Orchard extends orm.Model {
        static schema = {
          trees: [ Tree ]
        }
      }
      var main = new Orchard();
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
      class Foo extends orm.Model {
        static schema = {
          name: String
        }
      }
      class Bar extends orm.Model {
        static schema = {
          id: String,
          foo: Foo
        }
      }
      var bar = new Bar();
      expect( bar.foo.$parent ).to.equal( bar );
    });

    it( 'should return the parent of the parent collection', function() {
      class Foo extends orm.Model {}
      class Bar extends orm.Model {
        static schema = {
          foos: [ Foo ]
        }
      }
      var bar = new Bar();
      bar.foos.addNew();
      expect( bar.foos[0].$parent ).to.equal( bar );
    });
  });

  describe( '.$parentCollection', function() {
    it( 'should return the parent collection', function() {
      class Foo extends orm.Model {}
      class Bar extends orm.Model {
        static schema = {
          foos: [ Foo ]
        }
      }
      var bar = new Bar();
      bar.foos.addNew();
      expect( bar.foos[0].$parentCollection ).to.equal( bar.foos );
    });
  });
});
