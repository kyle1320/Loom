import ObjectDB from '../data/db/ObjectDB';
import Link from '../data/Link';

const db = new ObjectDB();

describe('can listen for field changes', () => {
  const parent = db.makeObject();
  parent.addOwnField('test', 'value1');
  parent.addOwnField('test.parent.1', 'value2');
  parent.addOwnField('test.parent.2', 'value3');

  const obj = db.makeObject(parent);
  obj.addOwnField('test', 'value4');
  obj.addOwnField('test.scope.1', 'value5');
  obj.addOwnField('test.scope.2', 'value6');

  const obj2 = db.makeObject(parent);
  obj2.addOwnField('test', 'value7');

  test('can listen on specific fields', () => {
    const mock = jest.fn();

    Link.to(obj, 'test').observe().content(true).on('update', mock);

    obj.fields['test']!.set('new value');
    obj.fields['test.scope.1']!.set('new value');

    expect(mock).toHaveBeenCalledTimes(1);
  });

  test('can listen on a path with a wildcard', () => {
    const mock = jest.fn();

    Link.to(obj, 'test.*').observe().content(true).on('update', mock);

    obj.fields['test']!.set('new value 2');
    obj.fields['test.scope.1']!.set('new value 2');
    obj.fields['test.scope.2']!.set('new value 2');

    expect(mock).toHaveBeenCalledTimes(2);
  });

  test('if recursive, fires an update when dependencies change', () => {
    const mock = jest.fn();

    Link.to(obj2, 'test').observe().content(true).on('update', mock);

    obj2.fields['test']!.set(`{${obj.id}|test}{${obj.id}|test.parent.2}`);
    obj.fields['test']!.set('new value 3');
    parent.fields['test.parent.2']!.set('new value 3');

    expect(mock).toHaveBeenCalledTimes(3);
  });

  test('if non-recursive, does not fire an update when dependencies change',
    () => {
      const mock = jest.fn();

      Link.to(obj2, 'test').observe().content(false).on('update', mock);

      obj2.fields['test']!.set(`{${obj.id}|test}{${obj.id}|test.parent.2}`);
      obj.fields['test']!.set('new value 3');
      parent.fields['test.parent.2']!.set('new value 3');

      expect(mock).toHaveBeenCalledTimes(1);
    }
  );

  test('handles dependency changes', () => {
    const mock = jest.fn();

    Link.to(obj2, 'test').observe().content(true).on('update', mock);

    obj2.fields['test']!.set(`new {${obj.id}|test}{${obj.id}|test.parent.2}`);
    expect(mock).toHaveBeenCalledTimes(1);

    // dependency field change causes update
    obj2.removeOwnField('test');
    expect(mock).toHaveBeenCalledTimes(2);
    obj2.addOwnField('test', 'new value 4');
    expect(mock).toHaveBeenCalledTimes(3);

    // new dependencies cause update
    obj2.fields['test']!.set(`{${parent.id}|test}`);
    expect(mock).toHaveBeenCalledTimes(4);

    // new dependency causes update
    parent.fields['test']!.set('new value 5');
    expect(mock).toHaveBeenCalledTimes(5);

    // old dependency does not cause update
    obj2.fields['test.parent.2']!.set('new value 6');
    expect(mock).toHaveBeenCalledTimes(5);
  });

  test('handles parent field visibility changes', () => {
    const mock = jest.fn();

    const parent = db.makeObject();
    parent.addOwnField('test.1', 'value1');

    const obj = db.makeObject(parent);
    obj.addOwnField('test.1', 'value2');

    Link.to(obj, 'test.*').observe().content(true).on('update', mock);

    parent.fields['test.1']!.set('value3');
    expect(mock).not.toHaveBeenCalled();

    obj.fields['test.1']!.set('value4');
    expect(mock).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test.1');
    expect(mock).toHaveBeenCalledTimes(2);

    obj.addOwnField('test.1', 'value5');
    expect(mock).toHaveBeenCalledTimes(3);

    obj.addOwnField('test.2', 'value6');
    expect(mock).toHaveBeenCalledTimes(4);

    parent.addOwnField('test.3', 'value6');
    expect(mock).toHaveBeenCalledTimes(5);

    parent.removeOwnField('test.1');
    expect(mock).toHaveBeenCalledTimes(5);

    parent.removeOwnField('test.3');
    expect(mock).toHaveBeenCalledTimes(6);
  });

  describe('handles removing listeners', () => {
    test('with no dependencies', () => {
      const mock = jest.fn();

      const obs = Link.to(obj, 'test.*').observe().content(true)
        .on('update', mock);

      obj.fields['test.scope.1']!.set(`new value ${Link.to(obj2, 'test')}`);
      obj2.fields['test']!.set('new value 6');
      expect(mock).toHaveBeenCalledTimes(2);

      obs.destroy();

      obj2.fields['test']!.set('new value 7');
      expect(mock).toHaveBeenCalledTimes(2);
    });

    test('with dependencies', () => {
      const mock = jest.fn();

      const obs = Link.to(obj, 'test.*').observe().content(true)
        .on('update', mock);

      obj.fields['test.scope.1']!.set('new value 5');
      expect(mock).toHaveBeenCalledTimes(1);

      obj.fields['test']!.set('new value 5');
      expect(mock).toHaveBeenCalledTimes(1);

      obs.destroy();

      obj.fields['test.scope.1']!.set('another new value 5');
      obj.fields['test.scope.2']!.set('new value 5');
      parent.fields['test.parent.1']!.set('new value 5');
      expect(mock).toHaveBeenCalledTimes(1);
    });
  });

  test('handles multiple overlapping listeners', () => {
    const mock1 = jest.fn();
    const mock2 = jest.fn();

    const parent = db.makeObject();
    const obj = db.makeObject(parent);

    parent.addOwnField('test.1', '');
    parent.addOwnField('test.2', '');
    parent.addOwnField('test.3', '');
    parent.addOwnField('test.nested.1', '');
    parent.addOwnField('test.nested.2', '');
    obj.addOwnField('test.1', '');
    obj.addOwnField('test.2', '');
    obj.addOwnField('test.nested.1', '');

    Link.to(obj, 'test.*').observe().content(true)
      .on('update', mock1);
    const obs2 = Link.to(obj, 'test.nested.*').observe().content(true)
      .on('update', mock2);

    obj.fields['test.1']!.set('1');
    expect(mock1).toHaveBeenCalledTimes(1);
    expect(mock2).toHaveBeenCalledTimes(0);

    obj.fields['test.nested.1']!.set('1');
    expect(mock1).toHaveBeenCalledTimes(2);
    expect(mock2).toHaveBeenCalledTimes(1);

    obj.addOwnField('test.nested.2', '');
    expect(mock1).toHaveBeenCalledTimes(3);
    expect(mock2).toHaveBeenCalledTimes(2);

    obj.removeOwnField('test.2');
    expect(mock1).toHaveBeenCalledTimes(4);
    expect(mock2).toHaveBeenCalledTimes(2);

    obs2.destroy();
    expect(mock1).toHaveBeenCalledTimes(4);
    expect(mock2).toHaveBeenCalledTimes(2);

    obj.removeOwnField('test.nested.2');
    expect(mock1).toHaveBeenCalledTimes(5);
    expect(mock2).toHaveBeenCalledTimes(2);

    obj.fields['test.nested.2']!.set('1');
    expect(mock1).toHaveBeenCalledTimes(6);
    expect(mock2).toHaveBeenCalledTimes(2);

    obj.fields['test.nested.1']!.set('2');
    expect(mock1).toHaveBeenCalledTimes(7);
    expect(mock2).toHaveBeenCalledTimes(2);
  });
});