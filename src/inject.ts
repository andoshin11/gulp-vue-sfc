import { DefaultExportObjectRegEx, DefaultExportReference } from './utils'

export default function inject(rawScript: string, template: string) {
  const { matches, script } = findInjectionPosition(rawScript);

  if (matches && matches.length) {
    const renderScript = `module.exports={\n  template: \`${template}\`,\n`;

    return script
      .split(matches[0])
      .join(
        renderScript.replace('module.exports={', matches[0]).replace(/\}$/, '')
      );
  }

  throw new Error(`cannot find 'export default'.`);
}

function findInjectionPosition(script: string): { script: string, matches: RegExpMatchArray | null } {
  const hasDefaultExportObject = script.match(DefaultExportObjectRegEx);

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
