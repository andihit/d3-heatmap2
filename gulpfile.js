var gulp = require('gulp')
var rollup = require('rollup-stream')
var source = require('vinyl-source-stream')
var uglify = require('gulp-uglify-es').default
var del = require('del')
var rename = require('gulp-rename')
var eslint = require('gulp-eslint')
var browserSync = require('browser-sync').create()

const rollupGlobals = {
  'd3': 'd3'
}

gulp.task('clean', function () {
  return del(['dist'])
})

gulp.task('lint', function () {
  return gulp.src(['./src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('rollup', function () {
  return rollup({
    input: './index.js',
    external: Object.keys(rollupGlobals),
    name: 'd3',
    format: 'umd',
    extend: true,
    sourcemap: false,
    globals: rollupGlobals
  })
    .pipe(source('d3-heatmap2.js'))
    .pipe(gulp.dest('./dist'))
})

gulp.task('uglify', function () {
  return gulp.src('./dist/d3-heatmap2.js')
    .pipe(gulp.dest('./dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
})

gulp.task('style', function () {
  return gulp.src('./src/heatmap.css')
    .pipe(rename('d3-heatmap2.css'))
    .pipe(gulp.dest('./dist'))
})

gulp.task('rollup-watch', gulp.series('rollup', function (done) {
  browserSync.reload()
  done()
}))

gulp.task('style-watch', gulp.series('style', function (done) {
  browserSync.reload()
  done()
}))

gulp.task('serve', gulp.series('lint', 'rollup', 'style', function () {
  browserSync.init({
    server: {
      baseDir: ['examples', 'dist']
    }
  })
  gulp.watch('./src/*.js', gulp.series('rollup-watch'))
  gulp.watch('./src/*.css', gulp.series('style-watch'))
}))

gulp.task('build', gulp.series('clean', 'lint', 'rollup', 'uglify', 'style'))

gulp.task('default', gulp.series('serve'))
