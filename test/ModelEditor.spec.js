import orm from '../src';

const schemaFactory = new orm.ModelSchemaFactory();
const schemaFromClass = schemaFactory.schemaFromClass.bind( schemaFactory );

describe( 'ModelEditor', function() {
  describe( '.edit()', function() {
    it( 'should return a fork', function() {
      class Foo extends orm.Model {
        static attrs = {
          bar: Number
        }
      }
      var editor = new orm.ModelEditor();
      var schema = schemaFromClass( Foo );
      var main = schema.cast();
      var edit = editor.edit( main );
      main.bar = 2;
      expect( main.bar ).to.equal( 2 );
      expect( edit.bar ).to.equal( 2 );
      edit.bar = 3;
      expect( main.bar ).to.equal( 2 );
      expect( edit.bar ).to.equal( 3 );
      editor.commit( edit );
      expect( main.bar ).to.equal( 3 );
    });

    it( 'should fork collections', function() {
      class Tree extends orm.Model {
        static attrs = {
          id: Number
        }
      }
      class Orchard extends orm.Model {
        static attrs = {
          trees: [ Tree ]
        }
      }
      var editor = new orm.ModelEditor();
      var schema = schemaFromClass( Orchard );
      var main = schema.cast();
      var edit = editor.edit( main );

      // No changes have been made to 'edit', so when we add an item to main
      // collection, the change is seen in both versions.
      main.trees.push( main.trees.create({ id: 1 }) );
      expect( main.trees.size ).to.equal( 1 );
      expect( edit.trees.size ).to.equal( 1 );

      // When we modify the collection in 'edit', the change only doesn't
      // appear in 'main'.
      edit.trees.push( edit.trees.create({ id: 2 }) );
      expect( edit.trees.size ).to.equal( 2 );
      expect( main.trees.size ).to.equal( 1 );

      // We change the main collection again, but this time, we don't see
      // the change in 'edit' because that version already has pending changes.
      main.trees.push( main.trees.create({ id: 3 }) );

      expect( main.trees.size ).to.equal( 2 );
      expect( edit.trees.size ).to.equal( 2 );

      // We still see the same two items in 'edit'.
      expect( edit.trees.get( 0 ).id ).to.equal( 1 );
      expect( edit.trees.get( 1 ).id ).to.equal( 2 );

      // We see the first and third item in 'main'.
      expect( main.trees.get( 0 ).id ).to.equal( 1 );
      expect( main.trees.get( 1 ).id ).to.equal( 3 );

      // When we commit the fork, the collection is replaced with the new
      // changes.
      editor.commit( edit );

      // Now we see the same items in both versions.
      expect( main.trees.size ).to.equal( 2 );
      expect( edit.trees.size ).to.equal( 2 );

      expect( main.trees.get( 0 ).id ).to.equal( 1 );
      expect( edit.trees.get( 0 ).id ).to.equal( 1 );

      expect( main.trees.get( 1 ).id ).to.equal( 2 );
      expect( edit.trees.get( 1 ).id ).to.equal( 2 );
    });
  });
});
