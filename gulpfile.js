/* eslint-env node */
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
const jade = require('gulp-pug');
const connect = require('gulp-connect');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const archiver = require('gulp-archiver');

// webpack
const webpack = require('webpack');
const wc = require('./webpack.config');
const pc = require('./package');

// settings
const opts = minimist(process.argv.slice(2), {
  string: 'open',
  boolean: 'release',
  alias: {
    o: 'open',
    r: 'release',
  },
  default: { release: false, open: undefined },
});

const DESTROOT = opts.release ? 'release' : 'dist';
const app = require('./server')({ dest: DESTROOT });

const HOST = '0.0.0.0';
const PORT = 8080;
const PATHS = {
  scripts: 'src/scripts/**/*.js',
  styles: 'src/styles/**/*.scss',
  templates: 'src/templates/*.jade',
  images: 'src/images/**/*',
  fonts: 'src/fonts/**/*',
};

// script
gulp.task('del:scripts', () => del(`${DESTROOT}/assets/js/*`));
gulp.task('scripts', ['del:scripts'], cb => {
  wc.output.path = `${DESTROOT}/assets/js/`;
  wc.output.publicPath = wc.output.publicPath.substr(1);
  wc.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
  }));
  webpack(wc).run(err => (err ? console.log(err) : cb()));
});

// styles
gulp.task('del:styles', () => del(`${DESTROOT}/assets/css/*`));
gulp.task('styles', ['del:styles'], () => gulp.src(PATHS.styles)
  .pipe(plumber())
  .pipe(sass())
  .on('error', sass.logError)
  .pipe(postcss([
    autoprefixer(),
    cssnano(),
  ]))
  .pipe(gulp.dest(`${DESTROOT}/assets/css`))
  .pipe(connect.reload())
);

// html
gulp.task('del:templates', () => del(`${DESTROOT}/*.html`));
gulp.task('templates', ['del:templates'], () => gulp.src(PATHS.templates)
  .pipe(plumber())
  .pipe(jade({
    pretty: true,
  }))
  .pipe(gulp.dest(`${DESTROOT}/`))
  .pipe(connect.reload())
);

// image
gulp.task('del:images', () => del(`${DESTROOT}/assets/img/*`));
gulp.task('images', () => gulp.src(PATHS.images)
  .pipe(plumber())
  .pipe(gulp.dest(`${DESTROOT}/assets/img/`))
  .pipe(connect.reload())
);

// fonts
gulp.task('del:fonts', () => del(`${DESTROOT}/assets/fonts/*`));
gulp.task('fonts', ['del:fonts'], () => gulp.src(PATHS.fonts)
  .pipe(plumber())
  .pipe(rename(path => { /* eslint no-param-reassign: "off" */path.dirname = ''; }))
  .pipe(gulp.dest(`${DESTROOT}/assets/fonts/`))
  .pipe(connect.reload())
);


// build files & open server
const devDep = ['templates', 'styles', 'images', 'fonts'];
const releaseDep = [...devDep, 'scripts'];

gulp.task('default', opts.release ? devDep : releaseDep, () => {
  gulp.watch(PATHS.styles, ['styles']);
  gulp.watch(PATHS.images, ['images']);
  gulp.watch(PATHS.fonts, ['fonts']);
  gulp.watch('src/templates/**/*.jade', ['templates']);
  connect.server({
    root: `${DESTROOT}`,
    port: PORT,
    host: HOST,
    livereload: true,
    middleware: () => [app],
  });
  if (opts.open !== undefined) {
    opn(`http://${HOST === 'localhost' ? HOST : ip.address()}:${PORT}/map`, {
      app: opts.open,
    }).then(() => {});
  }
  gutil.log('[gulp server started]', `http://${HOST === 'localhost' ? HOST : ip.address()}:${PORT}/map`);

  if (opts.release) {
    gulp.src(`${DESTROOT}/**/*`)
      .pipe(archiver(`${pc.name}.${Date.now()}.tar`))
      .pipe(gulp.dest('packages'));
  }
});
