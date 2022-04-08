const sass = require('gulp-sass')(require('sass'));
const { src, dest, watch, series } = require('gulp');
const browserSync = require("browser-sync").create();
const imagemin = require('gulp-imagemin');
const useref = require('gulp-useref');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-clean-css');
const del = require('del');
const cache = require('gulp-cache');
const concat = require('gulp-concat');

// CONST
const CONFIG = {
    DEFAULT_PORT: 4000,
    BASE_DIR: './dist'
};

const scss = () => {
    return src('src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        // .pipe(minifyCss())
        .pipe(dest('./dist/assets/css'))
        .pipe(browserSync.stream());
};

const serve = () => {
    browserSync.init({
        server: {
            baseDir: CONFIG.BASE_DIR,
        },
        watch: true,
        port: CONFIG.DEFAULT_PORT,
        browser: "chrome"
    });
};

const html = () => {
    return src('src/**/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(dest('./dist'))
        .pipe(browserSync.stream());
};


const js = () => {
    return src('src/assets/js/**/*.js')
        .pipe(gulpif('*.js', uglify()))
        .pipe(concat('script.js'))
        .pipe(dest('./dist/assets/js'))
        .pipe(browserSync.stream());
}

const images = () => {
    return src('src/assets/images/**/*.+(png|jpg|jpeg|gif|svg|ico)')
        .pipe(
            imagemin({
                optimizationLevel: 5, 
                interlaced: true
            })
        .pipe(dest('./dist/assets/images')));

};
const fonts = () => {
    // apply only webfont extendtion
    return src('src/assets/fonts/**/*.+(woff|woff2|ote|ttf)')
        .pipe(dest('./dist/assets/fonts'))
}

const cleanDist = async () => {
    return del.sync('./dist');
};

const cacheClear = async function (callback) {
    return cache.clearAll(callback)
};

const watchChange = () => {
    serve();
    watch('src/scss/**/*.scss', scss).on('change', browserSync.reload);
    watch('src/**/*.html', html).on('change', browserSync.reload);
    watch('src/**/*.+(png|jpg|jpeg|gif|svg|ico)', images).on('change', browserSync.reload);
    watch('src/assets/js/**/*.js', js).on('change', browserSync.reload);
    watch('src/assets/fonts/**/*.+(woff|woff2|ote|ttf)', fonts).on('change', browserSync.reload);
};

exports.build = series(fonts, scss, html, js, images , watchChange);
exports.scss = scss;
exports.html = html;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.cleanDist = cleanDist;
exports.cacheClear = cacheClear;
exports.watch = watchChange;
exports.default = watchChange;