import orm from '../src';

const schemaFactory = new orm.ModelSchemaFactory();
const schemaFromClass = schemaFactory.schemaFromClass.bind( schemaFactory );

describe( 'ModelCollection', function() {
  it( 'should be iterable', function() {
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
    orchard.trees.push( orchard.trees.create({ leaves: 2 }) );
    orchard.trees.push( orchard.trees.create({ leaves: 5 }) );

    var leaves = [];
    for ( let tree of orchard.trees ) {
      leaves.push( tree.leaves );
    }

    expect( leaves ).to.eql([ 2, 5 ]);
  });
});
