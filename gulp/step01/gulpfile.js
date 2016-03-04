var gulp = require("gulp"),
    sass = require("gulp-sass");

// 예제 1
gulp.task("default", function() {
    console.log("Hello world")
})

// 예제 2
gulp.task('compile-sass', function () {
    return gulp.src("./sass/**/*.sass")
        .pipe(sass())
        .pipe(gulp.dest("./css"));
});