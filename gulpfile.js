"use strict"
//system-wide dependencies
const path = require('path');
const opn = require('opn');
//dev dependencies
const gulp = require('gulp');
const gutil = require('gulp-util');

const del = require('del');
const sass = require('gulp-sass');
const jade = require('gulp-jade');
const babel = require('gulp-babel');
const connect = require('gulp-connect');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const app = require('./server');
// release dependencies
const autoprefixer = require('gulp-autoprefixer');
// let imagemin = require('gulp-imagemin');
// let pngquant = require('imagemin-pngquant');
const uglify = require('gulp-uglify');
//define constraints
const DEBUG = !(process.env.NODE_ENV==='production');
const HOST = '0.0.0.0';
const PORT = 8080;
const PATHS = {
    scripts: 'src/scripts/**/*.js',
    styles: 'src/styles/**/*.scss',
    templates: 'src/templates/*.jade',
    images: 'src/images/**/*',
    fonts: ['src/fonts/**/*', 'bower_components/**/dist/fonts/*']
}

const DESTROOT = DEBUG ? 'dist' : 'release';


gulp.task('del:styles', () => del(`${DESTROOT}/assets/css/*`));
gulp.task('copy:styles', ['del:styles'], ()=> {
    return gulp.src('bower_components/normalize-css/normalize.css')
        .pipe(rename(path=>path.dirname = ''))
        .pipe(gulp.dest(`${DESTROOT}/assets/css`));
});
gulp.task('styles', ['copy:styles'], () => (
    gulp.src(PATHS.styles)
        .pipe(plumber())
        .pipe(sass({
            outputStyle: DEBUG ? 'Nested' : 'compressed'
        })).on('error', sass.logError)
        .pipe(autoprefixer())
        .pipe(gulp.dest(`${DESTROOT}/assets/css`))
        .pipe(connect.reload())
));

gulp.task('del:templates', () => del(`${DESTROOT}/*.html`));
gulp.task('templates', ['del:templates'], () => (
    gulp.src(PATHS.templates)
        .pipe(plumber())
        .pipe(jade({
            pretty: DEBUG
        }))
        .pipe(gulp.dest(`${DESTROOT}/`))
        .pipe(connect.reload())
));

gulp.task('del:scripts', ()=>del(`${DESTROOT}/assets/js/*`));
gulp.task('copy:scripts', ['del:scripts'], ()=> {
    return gulp.src('bower_components/*/dist/**/@(jquery|bootstrap).min.js')
        .pipe(rename(path=>path.dirname = ''))
        .pipe(gulp.dest(`${DESTROOT}/assets/js/`))
})
gulp.task('scripts', ['copy:scripts'], () => {
    const stream = gulp.src(PATHS.scripts)
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015', 'stage-1']
        }))
    if (!DEBUG) {
        stream.pipe(uglify())
    }
    return stream.pipe(gulp.dest(`${DESTROOT}/assets/js/`))
        .pipe(connect.reload());
});

gulp.task('del:images', () => del(`${DESTROOT}/assets/img/*`));
gulp.task('images', () => {
    const stream = gulp.src(PATHS.images).pipe(plumber())
    // if (!DEBUG)stream.pipe(imagemin({
    //     progressive: true,
    //     interlaced: true,
    //     svgoPlugins: [{removeViewBox: false}],
    //     use: [pngquant()]
    // }));
    return stream.pipe(gulp.dest(`${DESTROOT}/assets/img/`)).pipe(connect.reload())
});


gulp.task('del:fonts', () => del(`${DESTROOT}/assets/fonts/*`));
gulp.task('fonts', ['del:fonts'], () =>(
    gulp.src(PATHS.fonts)
        .pipe(plumber())
        .pipe(rename(path=>path.dirname = ''))
        .pipe(gulp.dest(`${DESTROOT}/assets/fonts/`))
        .pipe(connect.reload())
));


gulp.task('compile', ['templates', 'styles', 'scripts', 'images', 'fonts']);

//server
gulp.task('server', ['compile'], () => {
    gulp.watch(PATHS.styles, ['styles']);
    gulp.watch(PATHS.templates, ['templates']);
    gulp.watch(PATHS.images, ['images']);
    gulp.watch(PATHS.scripts, ['scripts']);
    connect.server({
        root: `${DESTROOT}`,
        port: PORT,
        host: HOST,
        livereload: true,
        middleware(connect, opt){
            return [app]
        }
    });
    opn(`http://${HOST}:${PORT}/all`, {
        //app: 'firefox'
    }).then(() => {
        gutil.log('browser has opened');
    });
    gutil.log('[gulp server started]', `http://${HOST}:${PORT}`);
});


//watch or compile
gulp.task('default', ['server']);
