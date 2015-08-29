import { util } from '../src';

describe( 'util', function() {
  describe( 'factoryFromClass', function() {
    it( 'should return a factory function for a class', function() {
      class Foo {
        constructor( a ) {
          this.a = a;
        }
      }
      var factory = util.factoryFromClass( Foo );
      var foo = factory( 2 );
      expect( foo.a ).to.equal( 2 );
      expect( foo ).to.be.instanceof( Foo );
    });
  });
});
