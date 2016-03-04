var gulp = require('gulp');
var clean = require('gulp-clean'); // 폴더 및 파일 정리
var concat = require('gulp-concat'); // js 하나로 병합
var uglify = require('gulp-uglify'); // js 압축
var sass = require('gulp-sass'); // scss --> css 변환
var minifyCss = require('gulp-minify-css'); // css 압축
var webserver = require('gulp-webserver'); // localhost 기본 8000으로 웹서버 생성
var open = require('gulp-open'); // 이게 default 인가요...
var include = require("gulp-include"); // 모르겠다.
var compass = require('gulp-compass'); // compass 컴파일러
var plumber = require('gulp-plumber'); // 에러 핸들링

// 작업 경로 설정
var devSrc = 'front-src/dev';
var devPaths = {
    js: devSrc + '/js/',  // 추후 js폴더 밑에 다른 폴더가 생성되더라도 하위 js를 모두 적용
    scss: devSrc + '/css/**/*.scss',
    css: devSrc + '/css/**/*.css',
    fonts: devSrc + '/fonts/*',
    images: devSrc + '/images/**/*.*',
    html : devSrc + '/html/**/*.*'
};

// 결과물 경로 설정
var buildSrc = 'front-src/build';

// gulp.task 를 사용하여 task를 추가한다. '테스트명', function (){ return  }
// combine-js
gulp.task('combine-js', function () {
    return gulp.src(devPaths.js + "*.js") // 작업 중인 모든 js 호출
        .pipe(plumber({ // 에러 핸들링 (만약 스크립트 오류가 있음 여기서 에러 부분이 호출 된다.)
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }})) // 오류가 없을 시
        .pipe(concat('fantasy.js')) // 여러개의 js를 fantasy.js 안에 삽입
        .pipe(uglify())// fantasy.js 압축
        .pipe(gulp.dest(buildSrc + '/js'));  // 결과물 js 생성
});

// compile-sass
gulp.task('compile-sass', function () {
    return gulp.src(devPaths.scss) // 작업 중인 모든 sass 호출
        .pipe(plumber({ // 에러 핸들링 (scss 중 안닫거나 마침표가 없을경우 에러 부분 호출 된다.)
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }})) // 오류가 없을 시
        .pipe(compass({  // compass 부분을 컴파일러 하는거 같은데 정홛히 어떻게 돌아가는지 모르겠다.
            sass: devSrc + '/css',
            css: buildSrc+'/css',
            style:'compact'
        }))
        .pipe(gulp.dest(buildSrc+'/css')); // 결과물 css 생성
});

// html-move
gulp.task('html-move', function () {
    return gulp.src(devPaths.html) // 작업중인 모든 html 호출
        .pipe(plumber({ // 에러 핸들링
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }})) // 오류가 없을 시
        .pipe(include()) // include 의 뜻은 알겠는데 설명 필요
        .pipe(gulp.dest(buildSrc + '/html')); // 결과물 html 생성
});

// js-move (스크립트 이동)
gulp.task('js-move', function () {
    return gulp.src([devPaths.js + '**/*'])
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }}))
        .pipe(gulp.dest(buildSrc + '/js'));
});

// css-move(css 이동)
gulp.task('css-move', function () {
    return gulp.src(devPaths.css)
        .pipe(gulp.dest(buildSrc + '/css'));
});

// font-move(폰트 이동)
gulp.task('fonts-move', function () {
    return gulp.src(devPaths.fonts)
        .pipe(gulp.dest(buildSrc + '/fonts'));
});

// image-move(이미지 이동)
gulp.task('image-move', function () {
    return gulp.src(devPaths.images)
        .pipe(gulp.dest(buildSrc + '/images'));
});

// server (서버 설정 기본 :8000)
gulp.task('server', ['watch'], function () {
    var options = {
        uri: "http://localhost:9100/html/index.html", // 최초 실행할때 이주소로 나옴
        app: 'chrome' // 크롬 브라우저로 실행
    };
    return gulp.src(buildSrc + "/") // 결과물 폴더 호출
        .pipe(plumber({ // 에러 체크
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }})) // 오류 없을 시
        .pipe(webserver({
            livereload : true,
            port:9100
        })) // 포트를 8000 에서 9100으로 변경
        .pipe(open(options)); // option 변수 호출
});

// 파일 변경 실시간 감지 paths.js, paths.css, paths.html 해당 경로의 파일들의 수정이 일어나면 해당 테스크가 실행된다.
gulp.task('watch', function () {
    gulp.watch(devPaths.js, ['combine-js']);
    gulp.watch(devPaths.scss, ['compile-sass']);
    gulp.watch(devPaths.html, ['html-move']);
    gulp.watch(devPaths.html, ['js-move']);
    gulp.watch(devPaths.images, ['image-move']);
    gulp.watch(devPaths.images, ['fonts-move']);
});

// 파일 제거
gulp.task('clean', function () {
    return gulp.src(buildSrc, {read: false})// 결과물 폴더를 삭제 하는거 같은데 read: false 설명 필요
        .pipe(plumber({ // 에러 체크
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }}))
        .pipe(clean()); 제거
});

gulp.task('compile', ['combine-js', 'compile-sass', 'html-move', 'image-move', 'css-move', 'js-move','fonts-move'], function(){
    gulp.start('server')
}); // 결과물 생성

//기본 task 설정
gulp.task('default', ['clean'], function(){ // gulp-clean 으로 결과물 삭제 후
    gulp.start('compile'); // compile 호출
});