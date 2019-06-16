// @ts-ignore
import compilerES2015 from 'vue-template-es2015-compiler'
import { compile, SFCBlock } from 'vue-template-compiler'

export interface Options {
  preserveWhitespace?: boolean
}

export interface RenderedTemplate {
  render: string
  staticRenderFns: string
}

export default function parse(template: SFCBlock, options: Options = {}): RenderedTemplate {
  const _options: Options = {
    preserveWhitespace: false,
    ...options
  }

  const compiled = compile(template.content, _options)

  if (compiled.errors.length) {
    throw new Error(
      `\n  Error compiling template:\n\n` +
      compiled.errors.map(e => `  - ${e}`).join('\n') +
      '\n'
    );
  }

  return {
    render: toFunction(compiled.render),
    staticRenderFns: `[${compiled.staticRenderFns.map(toFunction).join(',')}]`
  };

}


function toFunction(code: string) {
  return compilerES2015(
    `var TEMP_VAR = function (){${code}}`
  ).replace('var TEMP_VAR = ', '');
}
