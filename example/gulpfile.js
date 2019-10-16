const gulp = require('gulp')
const VueSFCPlugin = require('gulp-vue-sfc').default
const { src, dest } = gulp

const output = dest('./tmp/dist')

gulp.task('convert:vue', () => {
  return src('./src/{components,views}/**/*.vue')
    .pipe(VueSFCPlugin())
    .pipe(output)
})

gulp.task('copy:ts', () => {
  return src('./src/{components,views}/**/*.ts').pipe(output)
})
