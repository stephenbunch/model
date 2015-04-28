var gulp = require( 'gulp' );

// TODO: Enable jshint again once ES7 'class properties' are supported.
gulp.task( 'make', function() {
  var fs = require( 'fs' );
  var browserify = require( 'browserify' );
  var babelify = require( 'babelify' );
  var source = require( 'vinyl-source-stream' );
  var babel = require( 'gulp-babel' );
  var merge = require( 'merge-stream' );
  var shim = require( 'browserify-global-shim' );
  var pkg = require( APP_ROOT + '/package' );

  var bundle = browserify({
      entries: APP_ROOT + '/src/index.js',
      debug: true,
      standalone: pkg.name
    })
    .transform(
      babelify.configure({
        sourceRoot: APP_ROOT + '/src',
        optional: [ 'es7.classProperties' ]
      })
    )
    .transform(
      shim.configure({
        'pathy': 'pathy'
      })
    )
    .bundle()
    .pipe( source( pkg.name + '.js' ) )
    .pipe( gulp.dest( 'dist' ) );

  var lib = gulp.src( APP_ROOT + '/src/**/*.js' )
    .pipe(
      babel({
        optional: [ 'es7.classProperties' ]
      })
    )
    .pipe( gulp.dest( APP_ROOT + '/lib' ) );

  return merge( bundle, lib );
});
