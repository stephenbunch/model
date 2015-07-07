import orm from '../src';

describe( 'ModelInspector', function() {
  describe( '.parentOfModel( model )', function() {
    it( 'should return the parent model', function() {
      class Foo extends orm.Model {
        static attrs = {
          name: String
        }
      }
      class Bar extends orm.Model {
        static attrs = {
          id: String,
          foo: Foo
        }
      }
      var inspector = new orm.ModelInspector();
      var bar = new Bar();
      expect( inspector.parentOfModel( bar.foo ) ).to.equal( bar );
    });

    it( 'should return the parent of the parent collection', function() {
      class Foo extends orm.Model {}
      class Bar extends orm.Model {
        static attrs = {
          foos: [ Foo ]
        }
      }
      var inspector = new orm.ModelInspector();
      var bar = new Bar();
      bar.foos.addNew();
      expect( inspector.parentOfModel( bar.foos.get( 0 ) ) ).to.equal( bar );
    });
  });

  describe( '.parentCollectionOfModel( model )', function() {
    it( 'should return the parent collection', function() {
      class Foo extends orm.Model {}
      class Bar extends orm.Model {
        static attrs = {
          foos: [ Foo ]
        }
      }
      var inspector = new orm.ModelInspector();
      var bar = new Bar();
      bar.foos.addNew();
      expect( inspector.parentCollectionOfModel( bar.foos.get( 0 ) ) ).to.equal( bar.foos );
    });
  });
});
