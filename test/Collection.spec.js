import orm from '../src';

describe( 'Collection', function() {
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

    var orchard = new Orchard();
    orchard.trees.push( orchard.trees.create({ leaves: 2 }) );
    orchard.trees.push( orchard.trees.create({ leaves: 5 }) );

    var leaves = [];
    for ( let tree of orchard.trees ) {
      leaves.push( tree.leaves );
    }

    expect( leaves ).to.eql([ 2, 5 ]);
  });
});
