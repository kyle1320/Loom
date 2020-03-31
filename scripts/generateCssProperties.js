const fetch = require('node-fetch');

(async function () {
  const properties = await fetch(
    'https://github.com/mdn/data/raw/master/css/properties.json'
  ).then(res => res.ok && res.json());
  const syntaxes = await fetch(
    'https://github.com/mdn/data/raw/master/css/properties.json'
  ).then(res => res.ok && res.json());

  if (!properties) return console.error('failed to fetch properties.json');
  if (!syntaxes) return console.error('failed to fetch syntaxes.json');

  const resolving = {};
  function resolveSyntax(syntax) {
    // cycle
    if (syntax in resolving) return syntax;
    resolving[syntax] = true;
    const syntaxParts = syntax.split(' | ');
    let res = '';
    if (syntaxParts.length === 1) {
      if (syntax.match(/^<[a-z-]+>$/i)) {
        const name = syntax.substring(1, syntax.length - 1);
        if (name in syntaxes) return resolveSyntax(syntaxes[name].syntax);
      }
      if (syntax.match(/^<'[a-z-]+'>$/i)) {
        const data = properties[syntax.substring(2, syntax.length - 2)];
        if (data) data.syntax;
      }
      if (syntax === '<string>' || syntax === '<string>+') res = '';
      else res = syntax;
    } else {
      res = syntaxParts.map(resolveSyntax).filter(Boolean).join(' | ');
    }
    delete resolving[syntax];
    return res;
  }

  function getType(syntax) {
    if (syntax && syntax.match(/^([a-z-]+( \| ))*[a-z-]*$/i)) return 'select';
    if (syntax === '<color>') return 'color';
    if (syntax === '<number>') return 'number';
    return 'any';
  }

  const all = {};

  for (const key in properties) {
    if (key.startsWith('-')) continue;

    const data = properties[key];
    const syntax = resolveSyntax(data.syntax)
    const info = { type: getType(syntax) };

    info.keywords = syntax
      .replace(/[^a-z0-9 ]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (syntax.match(/^([a-z-]+( \| ))*[a-z-]*$/i)) {
      info.values = syntax.split(' | ').concat('initial', 'inherit')
    }

    console.error(key);
    await fetch(`https://developer.mozilla.org/en-US/docs/Web/CSS/${key}$json`)
      .then(res => res.ok && res.json())
      .then(json => {
        info.summary = json
          ? json.summary.replace(/<a.*?>(.*?)<\/a>/g, '$1')
          : ''
      });

    all[key] = info;
  }

  console.log('/* eslint-disable */');
  console.log('export default ' + JSON.stringify(all, null, 2) + ' as const');
}());