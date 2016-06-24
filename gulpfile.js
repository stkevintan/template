/* eslint-env node */
 /* eslint no-param-reassign: "off" */
// tools
const opn = require('opn');
const ip = require('ip');
const gulp = require('gulp');
const gutil = require('gulp-util');
const minimist = require('minimist');

// build dependencies
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const del = require('del');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const connect = require('gulp-connect');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const filter = require('gulp-filter');
const inject = require('gulp-inject-string');
// settings
const opts = minimist(process.argv.slice(2), {
  boolean: ['compress', 'write'],
  string: 'open',
  alias: {
    c: 'compress',
    o: 'open',
    w: 'write',
  },
  default: { compress: false, open: undefined, write: false },
});

const DESTROOT = opts.compress ? 'release' : 'dist';
const app = require('./server')({
  dest: DESTROOT,
  write: opts.write,
});

const HOST = '0.0.0.0';
const PORT = 8080;
const PATHS = {
  styles: 'src/styles/**/*.scss',
  templates: 'src/templates/**/*.jade',
  images: 'src/images/**/*',
  fonts: 'src/fonts/**/*',
};
const pattern = /\/[^_][^\/]*$/;// filter vinyl object
// // styles
// gulp.task('del:styles', () => del(`${DESTROOT}/assets/css/*`));
// gulp.task('styles', ['del:styles'], () => gulp.src(PATHS.styles)
//   .pipe(plumber())
//   .pipe(filter(file => pattern.test(file.path)))
//   .pipe(sass({
//     outputStyle: opts.compress ? 'compressed' : 'Nested',
//   }))
//   .on('error', sass.logError)
//   .pipe(postcss([
//     autoprefixer(),
//     cssnano(),
//   ]))
//   .pipe(gulp.dest(`${DESTROOT}/assets/css`))
//   .pipe(connect.reload())
// );

// html
gulp.task('del:templates', () => del(`${DESTROOT}/*.html`));
gulp.task('templates', ['del:templates'], () => gulp.src(PATHS.templates)
  .pipe(plumber())
  .pipe(filter(file => pattern.test(file.path)))
  .pipe(pug({
    pretty: true,
  }))
  .pipe(opts.write ?
    inject.after('</title>', '\n<link rel="stylesheet" href="assets/css/styles.css">') :
    inject.before('</body>', '\n<script src="assets/js/styles.js"></script>'))
  .pipe(gulp.dest(`${DESTROOT}/`))
  .pipe(connect.reload())
);

// image
gulp.task('del:images', () => del(`${DESTROOT}/assets/img/*`));
gulp.task('images', () => gulp.src(PATHS.images)
  .pipe(plumber())
  .pipe(filter(file => pattern.test(file.path)))
  .pipe(gulp.dest(`${DESTROOT}/assets/img/`))
  .pipe(connect.reload())
);

// fonts
gulp.task('del:fonts', () => del(`${DESTROOT}/assets/fonts/*`));
gulp.task('fonts', ['del:fonts'], () => gulp.src(PATHS.fonts)
  .pipe(plumber())
  .pipe(filter(file => pattern.test(file.path)))
  .pipe(rename(path => { path.dirname = ''; }))
  .pipe(gulp.dest(`${DESTROOT}/assets/fonts/`))
  .pipe(connect.reload())
);

// build files & open server
gulp.task('default', ['templates', 'images', 'fonts'], () => {
  gulp.watch(PATHS.templates, ['templates']);
  // gulp.watch(PATHS.styles, ['styles']);
  gulp.watch(PATHS.images, ['images']);
  gulp.watch(PATHS.fonts, ['fonts']);
  gulp.watch(PATHS.images, ['images']);
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
    opn(`http://${HOST === 'localhost' ? HOST : ip.address()}:${PORT}/map`, {
      app: opts.open,
    }).then(() => {
      gutil.log('browser has opened');
    });
  }
  gutil.log('[gulp server started]', `http://${HOST === 'localhost' ? HOST : ip.address()}:${PORT}/map`);
});
