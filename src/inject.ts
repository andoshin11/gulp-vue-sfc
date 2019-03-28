import { RenderedTemplate } from './template'
import { DefaultExportObjectRegEx, DefaultExportReference } from './utils'

export default function inject(rawScript: string, render: RenderedTemplate) {
  const { matches, script } = findInjectionPosition(rawScript);

  if (matches && matches.length) {
    const staticRenderFnsStr = render.staticRenderFns !== '[]' ? `staticRenderFns: ${render.staticRenderFns}, \n` : '';
    const renderScript = `module.exports={\n  render: ${render.render},\n\n  ${staticRenderFnsStr}`;

    return script
      .split(matches[1])
      .join(
        renderScript.replace('module.exports={', matches[1]).replace(/\}$/, '')
      );
  }

  throw new Error(`cannot find 'export defaults'.`);
}

function findInjectionPosition(script: string): { script: string, matches: RegExpMatchArray | null } {
  const hasDefaultExportObject = DefaultExportObjectRegEx.exec(script);

  if (hasDefaultExportObject) return { script, matches: hasDefaultExportObject };

  const hasDefaultExportReference = DefaultExportReference.exec(script);

  if (!hasDefaultExportReference) return { script, matches: null };

  const name = hasDefaultExportReference[2].replace('$', '\\$');

  const result = new RegExp(`(${name}[\\s]=[^{]*\\{)`, 'g').exec(script);
  if (result) return { script, matches: result };

  const lit = new RegExp(`export\\s+default\\s+${name}`, 'g');
  script = script.replace(
    lit,
    `;
  var __$${name} = Object.assign(${name}, {})
  __$${name}.prototype = ${name}.prototype
  export default __$${name}
  `
  );
  const data = {
    matches: new RegExp(
      `(__\\$${name} = Object\\.assign\\(${name}, \\{)`,
      'g'
    ).exec(script),
    script
  };
  return data;
}
