export function evaluateLegacyLocale(source, blockly) {
  let categories = {};
  const localeBlockly = new Proxy(blockly, {
    get(target, property) {
      if (property === 'Categories') return categories;
      return Reflect.get(target, property);
    },
    set(target, property, value) {
      if (property === 'Categories') {
        categories = value;
        return true;
      }
      return Reflect.set(target, property, value);
    }
  });
  new Function('Blockly', 'goog', source)(localeBlockly, {
    provide() {},
    require() {}
  });
  return categories;
}
