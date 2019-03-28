# gulp-vue-sfc
Gulp plugin to transform Vue Single File Components into js/ts files

# Install

```bash
$ yarn add gulp-vue-sfc
```

# How to use

```js
// gulpfile.ts
import { src, dest } from 'gulp'
import VueSFCPlugin from 'gulp-vue-sfc'

function compileTask() {
  return src('./src/**/*.vue')
    .pipe(VueSFCPlugin())
    .pipe(dest('./dist'))
}

export default compileTask
```
