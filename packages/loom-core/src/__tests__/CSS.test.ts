import {
  SheetDef,
  StyleRuleDef,
  StyleDeclarationDef,
  RuleListDef } from '../definitions/CSS';
import { Sources } from '../definitions';

it('Sheet', () => {
  const el = new SheetDef([
    new StyleRuleDef('.test', {})
  ]);
  const sources = new Sources(null);
  const out = el.build(sources);

  expect(out.serialize()).toBe('.test{}');
});

it('RuleList', () => {
  const sheet = new RuleListDef([
    new StyleRuleDef('.test1', {}),
    new StyleRuleDef('.test2', {})
  ]);
  const sources = new Sources(null);
  const out = sheet.build(sources);

  const cb = jest.fn();
  out.on('add', cb);
  out.on('remove', cb);

  expect(out.serialize()).toBe('.test1{}\n.test2{}');

  sheet.add(new StyleRuleDef('.test3', {}));
  expect(cb).toHaveBeenLastCalledWith(2, out.get(2));
  expect(out.serialize()).toBe('.test1{}\n.test2{}\n.test3{}');

  const oldRule = out.get(0);
  sheet.removeIndex(0);
  expect(cb).toHaveBeenLastCalledWith(0, oldRule);
  expect(out.serialize()).toBe('.test2{}\n.test3{}');
});

it('StyleRule', () => {
  const rule = new StyleRuleDef('.test', {});
  const sources = new Sources(null);
  const out = rule.build(sources);

  const cb = jest.fn();
  out.selector.watch(cb);

  expect(out.serialize()).toBe('.test{}');

  rule.selector.set('.test > a');
  expect(cb).toHaveBeenLastCalledWith('.test > a', '.test');
  expect(out.serialize()).toBe('.test > a{}');
});

it('StyleDeclaration', () => {
  const rule = new StyleDeclarationDef({
    'color': 'red'
  });
  const sources = new Sources(null);
  const out = rule.build(sources);

  const cbSet = jest.fn();
  const cbDelete = jest.fn();
  out.on('set', cbSet);
  out.on('delete', cbDelete);

  expect(out.serialize()).toBe('color:red;');

  rule.set('border', '1px solid red');
  expect(cbSet).toHaveBeenLastCalledWith(
    'border', '1px solid red', undefined);
  expect(out.serialize()).toBe('color:red;border:1px solid red;');

  rule.delete('border');
  expect(cbDelete).toHaveBeenLastCalledWith('border', '1px solid red');
  expect(out.serialize()).toBe('color:red;');
});