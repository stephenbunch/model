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
      expect( orchard.trees ).to.be.instanceof( orm.ModelCollection );
      var tree = orchard.trees.create();
      expect( tree ).to.be.instanceof( Tree );
      expect( tree.leaves ).to.equal( 0 );
      orchard.trees.push( tree );
      expect( orchard.trees.size ).to.equal( 1 );
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
      foo.bar = {
        qux: [ 1, 2 ]
      };
      expect( foo.bar.qux ).to.eql([ 1, 2 ]);
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

  describe( '::cast( value )', function() {
    it( 'should wrap the object rather than making a copy', function() {
      var obj = { bar: 2 };

      class Foo extends orm.Model {
        static attrs = {
          bar: Number
        }
      }

      var foo = Foo.cast( obj );
      expect( foo.bar ).to.equal( 2 );

      obj.bar = 3;
      expect( foo.bar ).to.equal( 3 );
    });
  });

  describe( '::create()', function() {
    it( 'should behave the same way as the `new` operator', function() {
      class Foo extends orm.Model {
        static attrs = {
          bar: Number
        }
      };
      var foo = Foo.create();
      expect( foo.bar ).to.equal( 0 );
    });
  });
});
