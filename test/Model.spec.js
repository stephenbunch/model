import orm from '../src';

const schemaFactory = new orm.ModelSchemaFactory();
const schemaFromClass = schemaFactory.schemaFromClass.bind( schemaFactory );

describe( 'Model', function() {
  describe( '.toJSON()', function() {
    it( 'should format the underlying data according to the schema', function() {
      class Foo extends orm.Model {
        static attrs = {
          bar: Number
        }
      }

      var schema = schemaFromClass( Foo );
      var foo = schema.cast({
        baz: 4
      });

      foo.bar = 3;
      expect( foo.toJSON() ).to.eql({
        bar: 3
      });
    });

    it( 'should call .toJSON() on child values', function() {
      class Bar extends orm.Model {
        static attrs = {
          baz: Number,
          qux: Number
        }

        constructor() {
          super();

          this.qux = 5;
        }
      }

      class Foo extends orm.Model {
        static attrs = {
          bar: Bar
        }
      }

      var schema = schemaFromClass( Foo );
      var foo = schema.cast({
        bar: {
          baz: 3,
          foo: 4
        }
      });

      expect( foo.toJSON() ).to.eql({
        bar: {
          baz: 3,
          qux: 5
        }
      });
    });

    it( 'should call .toJSON() on child values after casting', function() {
      var custom = function( value ) {
        return {
          baz: 2,

          toJSON() {
            return {
              qux: 3
            }
          }
        }
      };
      class Foo extends orm.Model {
        static attrs = {
          bar: custom
        }
      }

      var schema = schemaFromClass( Foo );
      var foo = schema.cast();

      expect( foo.toJSON() ).to.eql({
        bar: {
          qux: 3
        }
      });
    });
  });
});
