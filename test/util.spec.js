import orm from '../src';

describe( 'util', function() {
  describe( 'merge', function() {
    it( 'should merge two objects', function() {
      var a = { foo: 2 };
      var b = { bar: 3 };
      expect( orm.util.merge( a, b ) ).to.eql({
        foo: 2,
        bar: 3
      });
    });

    it( 'should deeply merge two objects', function() {
      var a = { foo: { bar: 2 } };
      var b = { foo: { baz: 3 } };
      expect( orm.util.merge( a, b ) ).to.eql({
        foo: {
          bar: 2,
          baz: 3
        }
      });
    });

    it( 'should merge two arrays', function() {
      var a = [ 1, 2, 3, 6 ];
      var b = [ 4, undefined, 5 ];
      expect( orm.util.merge( a, b ) ).to.eql([ 4, 2, 5, 6 ]);
    });

    it( 'should deeply merge two arrays', function() {
      var a = [ { foo: 2 } ];
      var b = [ { bar: 3 } ];
      expect( orm.util.merge( a, b ) ).to.eql([{
        foo: 2,
        bar: 3
      }]);
    });
  });

  describe( 'factoryFromClass', function() {
    it( 'should return a factory function for a class', function() {
      class Foo {
        constructor( a ) {
          this.a = a;
        }
      }
      var factory = orm.util.factoryFromClass( Foo );
      var foo = factory( 2 );
      expect( foo.a ).to.equal( 2 );
      expect( foo ).to.be.instanceof( Foo );
    });
  });
});
