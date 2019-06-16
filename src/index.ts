import * as path from 'path'
import * as through2 from 'through2'
import { PluginError } from 'gulp-util'
import * as compiler from 'vue-template-compiler'
import templateParser from './template'
import templateInject from './inject'

function replaceExt(npath: string, ext: string) {
  if (typeof npath !== 'string') {
    return npath;
  }

  if (npath.length === 0) {
    return npath;
  }

  var nFileName = path.basename(npath, path.extname(npath)) + ext;
  return path.join(path.dirname(npath), nFileName);
}

export default function Plugin() {
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
      const script = component.script || { content: 'import Vue from "vue";\n\nexport default Vue.extend({});', attrs: { lang: 'ts' } };

      if (template) {
        // TODO: Inject as render function
        const render = templateParser(template)

        contents = templateInject(script.content, template.content)
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
