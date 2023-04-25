const gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var del = require("del");
const cleanCSS = require('gulp-clean-css');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify')
var minify = require('gulp-minify');
// var rev = require('gulp-rev');
var imagemin = require('gulp-imagemin')

gulp.task('imagemin', function () {
    return gulp.src("./src/public/assets/**/*")
        .pipe(imagemin([
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5})
        ]))
        .pipe(gulp.dest("./dist/public/assets"))
})
// Task which would transpile typescript to javascript
gulp.task("typescript", function () {
    return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("dist"));
});

// Task which would delete the old dist directory if present
gulp.task("build-clean", function () {
    return del(["./dist"]);
});

// Task which would just create a copy of the current views directory in dist directory
gulp.task("views", function () {
    return gulp.src("./src/views/**/*.ejs").pipe(gulp.dest("./dist/views"));
});

// Task which would just create a copy of the current static assets directory in dist directory
gulp.task("assets", function () {
    return gulp.src("./src/public/assets/**/*")
        .pipe(gulp.dest("./dist/public/assets"));
});

// Task which would just create a copy of the current static assets directory in dist directory
gulp.task("css", function () {
    return gulp.src("./src/public/css/**/*").pipe(gulp.dest("./dist/public/css"))
});
gulp.task('minify-css', () => {
    return gulp.src('./src/public/css/**/*.css')
        .pipe(minify())
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('./dist/public/css'));
});
// Task which would just create a copy of the current static assets directory in dist directory
gulp.task("js", function () {
    return gulp.src("./src/public/js/**/*")
        .pipe(minify())
        .pipe(gulp.dest("./dist/public/js"));
});
gulp.task('js', function () {
    return gulp.src("./src/public/js/**/*")
        .pipe(babel({
            presets: ['@babel/env']
        }))
        // .pipe(concat('concat.js')) //this will concat all the files into concat.js
        // .pipe(gulp.dest(baseDir + "/concat")) //this will save concat.js in a temp directory defined above
        // .pipe(rename('index.js')) //this will rename concat.js to index.js
        .pipe(uglify()) //this will uglify/minify uglify.js
        .pipe(gulp.dest("./dist/public/js"));
})
// The default task which runs at start of the gulpfile.js
gulp.task("default", gulp.series("build-clean", "typescript", "views", "assets", "css", "js"), () => {
    console.log("Done");
});
