import {
  SheetDef,
  StyleRuleDef,
  StyleDeclarationDef,
  RuleListDef } from '../definitions/CSS';
import { Sources } from '../definitions';

it('Sheet', () => {
  const el = new SheetDef('index.css', [
    new StyleRuleDef('.test', {})
  ]);
  const sources = new Sources({ root: 'home' });
  const out = el.build(sources);

  const cb = jest.fn();
  out.on('locationChanged', cb);

  expect(out.location).toBe('index.css');
  expect(out.serialize()).toBe('.test{}');

  el.location = '{{root}}/index.css';
  expect(cb).toHaveBeenLastCalledWith('home/index.css', 'locationChanged');
  expect(out.location).toBe('home/index.css');

  sources.vars.set('root', 'test');
  expect(cb).toHaveBeenLastCalledWith('test/index.css', 'locationChanged');
  expect(out.location).toBe('test/index.css');
});

it('RuleList', () => {
  const sheet = new RuleListDef([
    new StyleRuleDef('.test1', {}),
    new StyleRuleDef('.test2', {})
  ]);
  const sources = new Sources();
  const out = sheet.build(sources);

  const cb = jest.fn();
  out.on('add', cb);
  out.on('remove', cb);

  expect(out.serialize()).toBe('.test1{}\n.test2{}');

  sheet.add(new StyleRuleDef('.test3', {}));
  expect(cb).toHaveBeenLastCalledWith(
    { index: 2, value: out.get(2) }, 'add');
  expect(out.serialize()).toBe('.test1{}\n.test2{}\n.test3{}');

  sheet.remove(0);
  expect(cb).toHaveBeenLastCalledWith(0, 'remove');
  expect(out.serialize()).toBe('.test2{}\n.test3{}');
});

it('StyleRule', () => {
  const rule = new StyleRuleDef('.test', {});
  const sources = new Sources();
  const out = rule.build(sources);

  const cb = jest.fn();
  out.on('selectorChanged', cb);

  expect(out.serialize()).toBe('.test{}');

  rule.selectorText = '.test > a';
  expect(cb).toHaveBeenLastCalledWith('.test > a', 'selectorChanged');
  expect(out.serialize()).toBe('.test > a{}');
});

it('StyleDeclaration', () => {
  const rule = new StyleDeclarationDef({
    'color': 'red'
  });
  const sources = new Sources({
    primary: 'red'
  });
  const out = rule.build(sources);

  const cb = jest.fn();
  out.on('set', cb);
  out.on('delete', cb);

  expect(out.serialize()).toBe('color:red;');

  rule.set('border', '1px solid {{primary}}');
  expect(cb).toHaveBeenLastCalledWith(
    { key: 'border', value: '1px solid red' }, 'set');
  expect(out.serialize()).toBe('color:red;border:1px solid red;');

  sources.vars.set('primary', 'green');
  expect(cb).toHaveBeenLastCalledWith(
    { key: 'border', value: '1px solid green' }, 'set');
  expect(out.serialize()).toBe('color:red;border:1px solid green;');

  rule.delete('border');
  expect(cb).toHaveBeenLastCalledWith('border', 'delete');
  expect(out.serialize()).toBe('color:red;');

  sources.vars.set('primary', 'blue');
  expect(cb).toHaveBeenCalledTimes(3);
});