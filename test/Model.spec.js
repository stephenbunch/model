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
});
