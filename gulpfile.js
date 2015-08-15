/**
 * Created by vkusny on 15.08.15.
 */
var gulp = require("gulp"),
    concat = require("gulp-concat"),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-minify-css'),
    imgmin = require('gulp-imagemin'),
    path = require("path");

var src = ".";
var dst = path.resolve("public");

gulp.task("default", ["build"]);

gulp.task("build", ["css", "js", "html",  "img"]);

gulp.task("css", function() {
    gulp.src(path.join(src, "css/*.css"))
        .pipe(sourcemaps.init())
        .pipe(concat("styles.css"))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(dst));
});

gulp.task("html", function() {
    gulp.src(path.join(src, "index.html"))
        .pipe(gulp.dest(dst));
});

gulp.task("js", function() {
    gulp.src(path.join(src, "js/*.js"))
        .pipe(sourcemaps.init())
        .pipe(concat("app.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(dst));
});

gulp.task("img", function() {
    gulp.src(path.join(src, "img/*"))
        .pipe(imgmin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest(path.join(dst, "img")));
});