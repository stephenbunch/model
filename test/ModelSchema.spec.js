import orm from '../src';

const schemaFactory = new orm.ModelSchemaFactory();
const schemaFromClass = schemaFactory.schemaFromClass.bind( schemaFactory );

describe( 'ModelSchema', function() {
  describe( '.cast( value )', function() {
    it( 'should cast members as the specified type', function() {
      class Foo extends orm.Model {
        static attrs = {
          bar: Number
        }
      }
      var schema = schemaFromClass( Foo );
      var foo = schema.cast();
      foo.bar = '3';
      expect( foo.bar ).to.equal( 3 );
      expect( foo ).to.be.instanceof( Foo );
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

      var schema = schemaFromClass( Orchard );
      var orchard = schema.cast();
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

      var schema = schemaFromClass( Foo );
      var foo = schema.cast();
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

      var schema = schemaFromClass( Foo );
      var foo = schema.cast();
      expect( foo.bar ).to.equal( null );
      foo.bar = {};
      expect( foo.bar.baz ).to.equal( 0 );
      foo.bar = null;
      expect( foo.bar ).to.equal( null );
    });

    it( 'should wrap the object rather than making a copy', function() {
      var obj = { bar: 2 };

      class Foo extends orm.Model {
        static attrs = {
          bar: Number
        }
      }

      var schema = schemaFromClass( Foo );
      var foo = schema.cast( obj );
      expect( foo.bar ).to.equal( 2 );

      obj.bar = 3;
      expect( foo.bar ).to.equal( 3 );
    });
  });
});
