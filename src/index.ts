import * as through2 from 'through2'
import { PluginError } from 'gulp-util'
import * as compiler from 'vue-template-compiler'
import replaceExt from 'replace-ext'
import templateParser from './template'
import templateInject from './inject'

export default function Plugin () {
  const transform: through2.TransformFunction = (file, _, callback) => {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      // @ts-ignore
      this.emit('error', new PluginError('gulp-vue-sfc', 'Streams not supported!'));
    }

    if (file.isBuffer()) {
      let contents: string
      const component = compiler.parseComponent(String(file.contents))
      const { template } = component
      const script = component.script ||  { content: 'import Vue from "vue";\n\nexport default Vue.extend({});', attrs: { lang: 'ts'} };

      if (template) {
        const render = templateParser(template)
        contents = templateInject(script.content, render)
      } else {
        contents = script.content
      }

      file.contents = new Buffer(contents);
      file.path = replaceExt(file.path, '.' + script.attrs.lang)
      return callback(null, file);
    }

    // @ts-ignore
    this.push(file);
    callback();
  }

  return through2.obj(transform)
}
