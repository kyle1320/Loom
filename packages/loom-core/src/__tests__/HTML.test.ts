import {
  ElementDef,
  TextNodeDef,
  AttributesDef,
  ComponentDef,
  ChildrenDef,
  PageDef } from '../definitions/HTML';
import { Sources } from '../definitions';
import { UnknownComponent, Element } from '../build/HTML';

it('Page', () => {
  const el = new PageDef(
    new ElementDef('head', {}, []),
    new ElementDef('body', {}, [])
  );
  const sources = new Sources(null);
  const out = el.build(sources);

  expect(out.serialize())
    .toBe('<!doctype HTML><html><head></head><body></body></html>');
});

it('Element', () => {
  const el = new ElementDef('div', { title: 'test'}, [
    new TextNodeDef('testing')
  ]);
  const out = el.build(new Sources(null));

  const cb = jest.fn();
  out.tag.watch(cb);

  expect(out.serialize()).toBe('<div title="test">testing</div>');

  el.tag.set('span');
  expect(cb).toHaveBeenLastCalledWith('span', 'div');
  expect(out.serialize()).toBe('<span title="test">testing</span>');
});

it('TextNode', () => {
  const sources = new Sources(null);
  const el = new TextNodeDef('testing');
  const out = el.build(sources);

  const cb = jest.fn();
  out.content.watch(cb);

  expect(out.serialize()).toBe('testing');

  el.content.set('testing abc');
  expect(cb).toHaveBeenLastCalledWith('testing abc', 'testing');

  el.content.set('testing');
  expect(cb).toHaveBeenLastCalledWith('testing', 'testing abc');
  expect(cb).toHaveBeenCalledTimes(3);
});

it('Component', () => {
  const def = new ElementDef('div', {}, [new TextNodeDef('abc')]);
  const sources = new Sources(null);
  const comp = new ComponentDef('Test');
  const out = comp.build(sources);

  const cb = jest.fn();
  out.element.watch(cb);

  expect(out.serialize()).toBe('');
  expect(out.element.get()).toBeInstanceOf(UnknownComponent);

  let oldEl = out.element.get();
  sources.components.set('Test', def);
  expect(cb).toHaveBeenLastCalledWith(out.element.get(), oldEl);
  expect(out.serialize()).toBe('<div>abc</div>');
  expect(out.element.get()).toBeInstanceOf(Element);

  oldEl = out.element.get();
  comp.name.set('Bad');
  expect(cb).toHaveBeenLastCalledWith(out.element.get(), oldEl);
  expect(out.serialize()).toBe('');
  expect(out.element.get()).toBeInstanceOf(UnknownComponent);
});

it('Attributes', () => {
  const sources = new Sources(null);
  const attrs = new AttributesDef({ title: 'test' });
  const out = attrs.build(sources);

  const cbSet = jest.fn();
  const cbDelete = jest.fn();
  out.on('set', cbSet);
  out.on('delete', cbDelete);

  expect(out.serialize()).toBe(' title="test"');

  attrs.set('some attr', 'test')
  expect(cbSet).toHaveBeenLastCalledWith('some-attr', 'test', undefined);
  expect(out.serialize()).toBe(' title="test" some-attr="test"');

  attrs.delete('some attr');
  expect(cbDelete).toHaveBeenLastCalledWith('some-attr', 'test');
  expect(out.serialize()).toBe(' title="test"');
});

it('Children', () => {
  const def = new ElementDef('div', {}, [new TextNodeDef('abc')]);
  const sources = new Sources(null, { 'Test': def });
  const el = new ElementDef('div', {}, []);
  const comp = new ComponentDef('Test');
  const text = new TextNodeDef('testing abc');
  const children = new ChildrenDef([el, comp, text]);
  const out = children.build(sources);

  const cbAdd = jest.fn();
  const cbRemove = jest.fn();
  out.on('add', cbAdd);
  out.on('remove', cbRemove);

  expect(out.serialize()).toBe('<div></div><div>abc</div>testing abc');

  children.removeIndex(1);
  expect(cbRemove).toHaveBeenCalledTimes(1);

  expect(out.serialize()).toBe('<div></div>testing abc');
});