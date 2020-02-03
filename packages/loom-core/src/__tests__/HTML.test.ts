import {
  ElementDef,
  TextNodeDef,
  AttributesDef,
  ComponentDef,
  ChildrenDef,
  PageDef } from '../definitions/HTML';
import { Sources } from '../definitions';
import { EmptyComponent } from '../build/HTML';

it('Page', () => {
  const el = new PageDef(
    new ElementDef('head', {}, []),
    new ElementDef('body', {}, [])
  );
  const sources = new Sources({ root: 'home' });
  const out = el.build(sources);

  expect(out.serialize())
    .toBe('<!doctype HTML><html><head></head><body></body></html>');
});

it('Element', () => {
  const el = new ElementDef('div', { title: 'test'}, [
    new TextNodeDef('testing')
  ]);
  const out = el.build(new Sources());

  const cb = jest.fn();
  out.on('tagChanged', cb);

  expect(out.serialize()).toBe('<div title="test">testing</div>');

  el.tag = 'span';
  expect(cb).toHaveBeenLastCalledWith('span', 'tagChanged');
  expect(out.serialize()).toBe('<span title="test">testing</span>');
});

it('TextNode', () => {
  const sources = new Sources({ val: 'abc' });
  const el = new TextNodeDef('testing');
  const out = el.build(sources);

  const cb = jest.fn();
  out.on('contentChanged', cb);

  expect(out.serialize()).toBe('testing');

  el.content = 'testing {{val}}';
  expect(cb).toHaveBeenLastCalledWith('testing abc', 'contentChanged');

  sources.vars.set('val', 'def')
  expect(cb).toHaveBeenLastCalledWith('testing def', 'contentChanged');

  el.content = 'testing';
  expect(cb).toHaveBeenLastCalledWith('testing', 'contentChanged');

  sources.vars.set('val', 'def')
  expect(cb).toHaveBeenCalledTimes(3);
});

it('Component', () => {
  const def = new ElementDef('div', {}, [new TextNodeDef('{{val}}')]);
  const sources = new Sources({ val: 'abc' }, { 'Test': def });
  const el = new ComponentDef('Test');
  const out = el.build(sources);

  const cb = jest.fn();
  out.on('elementChanged', cb);

  expect(out.serialize()).toBe('<div>abc</div>');

  def.attrs.set('title', 'test');
  expect(cb).not.toHaveBeenCalled();
  expect(out.serialize()).toBe('<div title="test">abc</div>');

  sources.components.delete('Test');
  expect(cb).toHaveBeenCalled();
  expect(out.serialize()).toBe('');
});

it('Attributes', () => {
  const sources = new Sources({ val: 'abc' });
  const attrs = new AttributesDef({ title: 'test' });
  const out = attrs.build(sources);

  const cb = jest.fn();
  out.on('set', cb);
  out.on('delete', cb);

  expect(out.serialize()).toBe(' title="test"');

  attrs.set('value', '{{val}}');
  expect(cb).toHaveBeenLastCalledWith({ key: 'value', value: 'abc' }, 'set');
  expect(out.serialize()).toBe(' title="test" value="abc"');

  sources.vars.set('val', 'def');
  expect(cb).toHaveBeenLastCalledWith({ key: 'value', value: 'def' }, 'set');
  expect(out.serialize()).toBe(' title="test" value="def"');

  attrs.delete('value');
  expect(cb).toHaveBeenLastCalledWith('value', 'delete');
  expect(out.serialize()).toBe(' title="test"');

  sources.vars.set('val', 'abc');
  expect(cb).toHaveBeenCalledTimes(3);
});

it('Children', () => {
  const def = new ElementDef('div', {}, [new TextNodeDef('{{val}}')]);
  const sources = new Sources({ val: 'abc' }, { 'Test': def });
  const el = new ElementDef('div', {}, []);
  const comp = new ComponentDef('Test');
  const text = new TextNodeDef('testing {{val}}');
  const children = new ChildrenDef([el, comp, text]);
  const out = children.build(sources);

  const cb = jest.fn();
  out.on('add', cb);
  out.on('remove', cb);
  out.on('update', cb);

  expect(out.serialize()).toBe('<div></div><div>abc</div>testing abc');

  comp.name = 'Bad';
  expect(cb).toHaveBeenLastCalledWith(
    { index: 1, value: out.get(1) }, 'update');
  expect(out.serialize()).toBe('<div></div>testing abc');
  expect(out.get(1)).toBeInstanceOf(EmptyComponent);

  children.remove(1);
  expect(cb).toHaveBeenLastCalledWith(1, 'remove');

  comp.name = 'Test';
  expect(cb).toHaveBeenCalledTimes(2);
});