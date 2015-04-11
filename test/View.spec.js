describe( 'View', function() {
  describe( '.get( path )', function() {
    it( 'should return the local value if it exists, otherwise the subview\'s value if the subview exists', function() {
      var view = new model.View();
      expect( view.get( 'foo' ) ).to.be.undefined;

      var subview = {
        get: sinon.stub().returns( 2 )
      };
      view = new model.View( subview );

      expect( view.get( 'foo' ) ).to.equal( 2 );
      expect( subview.get ).to.have.been.calledWith( 'foo' );

      view.set( 'foo', 'hello' );
      expect( view.get( 'foo' ) ).to.equal( 'hello' );
    });
  });

  describe( '.set( path )', function() {
    it( 'should set the local value', function() {
      var view = new model.View();
      view.set( 'foo.bar.baz', 2 );
      expect( view.get( 'foo' ) ).to.eql({
        bar: {
          baz: 2
        }
      });
    });
  });

  describe( '.toJSON()', function() {
    it( 'should return the merge result of the local value and the subview\'s toJSON value', function() {
      var subview = {
        toJSON: sinon.stub().returns({ foo: 2 })
      };
      var view = new model.View( subview );
      view.set( 'bar.baz', 2 );
      expect( view.toJSON() ).to.eql({
        foo: 2,
        bar: {
          baz: 2
        }
      });
    });
  });

  describe( '.merge( object )', function() {
    it( 'should merge the specified object with the view\'s local value', function() {
      var view = new model.View();
      view.set( 'foo.bar', 2 );
      view.merge({
        foo: {
          baz: 3
        }
      });
      expect( view.toJSON() ).to.eql({
        foo: {
          bar: 2,
          baz: 3
        }
      });
    });
  });

  describe( '.commit()', function() {
    it( 'should merge the local value into the subview and reset the view', function() {
      var subview = {
        get: sinon.stub().returns( 3 ),
        merge: sinon.stub()
      };
      var view = new model.View( subview );
      view.set( 'foo', 2 );
      view.commit();
      expect( subview.merge ).to.have.been.calledWith( sinon.match({ foo: 2 }) );
      expect( view.get( 'foo' ) ).to.equal( 3 );
    });

    it( 'should throw an error if subview is not provided', function() {
      var view = new model.View();
      expect( function() {
        view.commit();
      }).to.throw( Error );
    });
  });
});
