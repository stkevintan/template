/* eslint-env node */
// tools
const opn = require('opn');
const gulp = require('gulp');
const gutil = require('gulp-util');
const minimist = require('minimist');

// build dependencies
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const del = require('del');
const sass = require('gulp-sass');
const jade = require('gulp-jade');
const babel = require('gulp-babel');
const connect = require('gulp-connect');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');


// settings
// const opts.dev = !(process.env.NODE_ENV==='production');
const opts = minimist(process.argv.slice(2), {
  boolean: ['compress'],
  alias: {
    c: 'compress',
    o: 'open',
  },
  string: 'open',
  default: { compress: false, open: undefined },
});

const DESTROOT = opts.compress ? 'release' : 'dist';
const app = require('./server')({
  dest: DESTROOT,
});

const HOST = '0.0.0.0';
const PORT = 8080;
const PATHS = {
  scripts: 'src/scripts/**/*.js',
  styles: 'src/styles/**/*.scss',
  templates: 'src/templates/*.jade',
  images: 'src/images/**/*',
  fonts: ['src/fonts/**/*', 'bower_components/**/dist/fonts/*'],
};

gulp.task('del:styles', () => del(`${DESTROOT}/assets/css/*`));
gulp.task('styles', ['del:styles'], () => (
    gulp.src(PATHS.styles)
        .pipe(plumber())
        .pipe(sass({
          outputStyle: opts.compress ? 'compressed' : 'Nested',
        }))
        .on('error', sass.logError)
        .pipe(postcss([
          autoprefixer(),
          cssnano(),
        ]))
        .pipe(gulp.dest(`${DESTROOT}/assets/css`))
        .pipe(connect.reload())
));

gulp.task('del:templates', () => del(`${DESTROOT}/*.html`));
gulp.task('templates', ['del:templates'], () => (
    gulp.src(PATHS.templates)
        .pipe(plumber())
        .pipe(jade({
            // pretty: !opts.compress
        }))
        .pipe(gulp.dest(`${DESTROOT}/`))
        .pipe(connect.reload())
));

// gulp.task('scripts', () => {
//   const stream = gulp.src(PATHS.scripts)
//         .pipe(plumber())
//         .pipe(babel({
//           presets: ['es2015', 'stage-1'],
//         }));
//   if (opts.compress) stream.pipe(uglify());
//   return stream.pipe(gulp.dest(`${DESTROOT}/assets/js/`))
//         .pipe(connect.reload());
// });

gulp.task('del:images', () => del(`${DESTROOT}/assets/img/*`));
gulp.task('images', () => {
  const stream = gulp.src(PATHS.images).pipe(plumber());
    // if (!opts.dev)stream.pipe(imagemin({
    //     progressive: true,
    //     interlaced: true,
    //     svgoPlugins: [{removeViewBox: false}],
    //     use: [pngquant()]
    // }));
  return stream.pipe(gulp.dest(`${DESTROOT}/assets/img/`)).pipe(connect.reload());
});


gulp.task('del:fonts', () => del(`${DESTROOT}/assets/fonts/*`));
gulp.task('fonts', ['del:fonts'], () => (
    gulp.src(PATHS.fonts)
        .pipe(plumber())
        .pipe(rename(path => { /* eslint no-param-reassign: "off" */path.dirname = ''; }))
        .pipe(gulp.dest(`${DESTROOT}/assets/fonts/`))
        .pipe(connect.reload())
));


gulp.task('compile', ['templates', 'styles', 'images', 'fonts']);


// server
gulp.task('server', ['compile'], () => {
  gulp.watch(PATHS.styles, ['styles']);
  gulp.watch(PATHS.templates, ['templates']);
  gulp.watch(PATHS.images, ['images']);
  // gulp.watch(PATHS.scripts, ['scripts']);
  connect.server({
    root: `${DESTROOT}`,
    port: PORT,
    host: HOST,
    livereload: true,
    middleware() {
      return [app];
    },
  });
  if (opts.open !== undefined) {
    opn(`http://${HOST}:${PORT}/map`, {
      app: opts.open,
    }).then(() => {
      gutil.log('browser has opened');
    });
  }
  gutil.log('[gulp server started]', `http://${HOST}:${PORT}/map`);
});


// watch or compile
gulp.task('default', ['server']);
