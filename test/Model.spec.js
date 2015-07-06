import orm from '../src';

describe( 'Model', function() {
  describe( 'Class', function() {
    it( 'can be extended', function() {
      class Foo extends orm.Model {
        static attrs = {
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
        static attrs = {
          bar: Number
        }
      }
      var foo = new Foo();
      foo.bar = '3';
      expect( foo.bar ).to.equal( 3 );
    });

    it( 'should treat arrays as collections', function() {
      class Tree extends orm.Model {
        static attrs = {
          leaves: Number
        }
      }

      class Orchard extends orm.Model {
        static attrs = {
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

    it( 'should return an empty object for null paths', function() {
      class Foo extends orm.Model {
        static attrs = {
          bar: {
            baz: Number,
            qux: [ Number ]
          }
        }
      }

      var foo = new Foo();
      expect( foo.bar.baz ).to.equal( 0 );
      expect( foo.bar.qux ).to.eql( [] );
    });

    it( 'should return null for nullable paths unless the path has a value', function() {
      class Foo extends orm.Model {
        static attrs = {
          bar: orm.Type.nullable({
            baz: Number
          })
        }
      }

      var foo = new Foo();
      expect( foo.bar ).to.equal( null );
      foo.bar = {};
      expect( foo.bar.baz ).to.equal( 0 );
      foo.bar = null;
      expect( foo.bar ).to.equal( null );
    });
  });

  describe( '::new()', function() {
    it( 'should behave the same way as the `new` operator', function() {
      class Foo extends orm.Model {
        static attrs = {
          bar: Number
        }
      };
      var foo = Foo.new();
      expect( foo.bar ).to.equal( 0 );
    });
  });
});
