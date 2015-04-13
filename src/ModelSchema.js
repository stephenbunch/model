exports.ModelSchema = ModelSchema;

function ModelSchema( paths, options ) {
  this.paths = paths;
  this.options = options || {};

  this.members = this.options.members || {};
  delete this.options.members;

  if ( this.members.init ) {
    this.initializer = this.members.init;
    delete this.members.init;
  }
}

ModelSchema.prototype.new = function( defaults ) {
  return this.cast( cloneDeep( defaults || {} ) );
};

ModelSchema.prototype.cast = function( value ) {
  if ( value === undefined || value === null ) {
    return null;
  }
  var view;
  if ( value instanceof Model ) {
    if ( value.$schema === this ) {
      return value;
    }
    view = value.$view;
  } else if ( value instanceof View ) {
    view = value;
  } else {
    if ( value.toJSON ) {
      value = value.toJSON();
    }
    view = new View();
    view.merge( value );
  }
  var model = new Model( this, view );
  this.addPaths( model );
  this.addMembers( model );
  if ( this.initializer ) {
    this.initializer.call( model );
  }
  return model;
};

/**
 * @param {Model} model
 */
ModelSchema.prototype.addPaths = function( model ) {
  var self = this;
  this.paths.forEach( function( path ) {
    if (
      path.type.type instanceof CollectionSchema &&
      path.type.type.type.type instanceof ModelSchema
    ) {
      self.addCollectionPath( model, path );
    } else {
      self.addAttributePath( model, path );
    }
  });
};

/**
 * @param {Model} model
 * @param {SchemaPath} path
 */
ModelSchema.prototype.addCollectionPath = function( model, path ) {
  var collection = new Collection( model, path.name, path.type.type.type.type );
  pathy( path.name ).override( model, {
    get: function() {
      return collection;
    }
  });
};

/**
 * @param {Model} model
 * @param {SchemaPath} path
 */
ModelSchema.prototype.addAttributePath = function( model, path ) {
  pathy( path.name ).override( model, {
    initialize: false,
    get: function() {
      return path.type.cast( model.$view.get( path.name ) );
    },
    set: function( value ) {
      model.$view.set( path.name, path.type.cast( value ) );
    }
  });
};

/**
 * @param {Model} model
 */
ModelSchema.prototype.addMembers = function( model ) {
  var self = this;
  Object.keys( this.members ).forEach( function( key ) {
    var member = self.members[ key ];
    var descriptor = {};

    if ( typeof member === 'function' ) {
      self.addFunctionMember( model, member, key );
    } else if ( !!member && typeof member === 'object' ) {
      self.addPropertyMember( model, member, key );
    }
  });
};

/**
 * @param {Model} model
 * @param {Function} func
 * @param {String} key
 */
ModelSchema.prototype.addFunctionMember = function( model, func, key ) {
  func = bind( func, model );
  pathy( key ).override( model, {
    get: function() {
      return func;
    }
  });
};

/**
 * @param {Model} model
 * @param {Object} accessors
 * @param {String} key
 */
ModelSchema.prototype.addPropertyMember = function( model, accessors, key ) {
  var descriptor = {};
  if ( typeof accessors.get === 'function' ) {
    descriptor.get = bind( accessors.get, model );
  }
  if ( typeof accessors.set === 'function' ) {
    descriptor.set = bind( accessors.set, model );
  }
  if ( Object.keys( descriptor ).length > 0 ) {
    descriptor.initialize = false;
    pathy( key ).override( model, descriptor );
  }
};
