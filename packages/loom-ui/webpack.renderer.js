module.exports = function (config) {
  const rule = config.module.rules.find(x => x.test.toString().match(/.tsx\?/));
  const loader = rule.use.find(x => x.loader === 'ts-loader')
  loader && (loader.options.projectReferences = true);
  return config;
}