import Project from '../data/Project';
import BasicField from '../data/BasicField';

const project = new Project();

describe('can listen for field changes', () => {
  const parent = project.makeObject('test');
  parent.addOwnField('test', new BasicField('value1'));
  parent.addOwnField('test.parent.1', new BasicField('value2'));
  parent.addOwnField('test.parent.2', new BasicField('value3'));

  const obj = project.makeObject('test', parent);
  obj.addOwnField('test', new BasicField('value4'));
  obj.addOwnField('test.scope.1', new BasicField('value5'));
  obj.addOwnField('test.scope.2', new BasicField('value6'));

  const obj2 = project.makeObject('test', parent);
  obj2.addOwnField('test', new BasicField('value7'));

  test('can listen on specific fields', () => {
    const mock = jest.fn();

    obj.getLink('test').observe().content(true).on('update', mock);

    (obj.getField('test') as BasicField).set('new value');
    (obj.getField('test.scope.1') as BasicField).set('new value');

    expect(mock).toHaveBeenCalledTimes(1);
  });

  test('can listen on a path with a wildcard', () => {
    const mock = jest.fn();

    obj.getLink('test.*').observe().content(true).on('update', mock);

    (obj.getField('test') as BasicField).set('new value 2');
    (obj.getField('test.scope.1') as BasicField).set('new value 2');
    (obj.getField('test.scope.2') as BasicField).set('new value 2');

    expect(mock).toHaveBeenCalledTimes(2);
  });

  test('if recursive, fires an update when dependencies change', () => {
    const mock = jest.fn();

    obj2.getLink('test').observe().content(true).on('update', mock);

    (obj2.getField('test') as BasicField)
      .set(`{${obj.id}|test}{${obj.id}|test.parent.2}`);
    (obj.getField('test') as BasicField).set('new value 3');
    (parent.getField('test.parent.2') as BasicField).set('new value 3');

    expect(mock).toHaveBeenCalledTimes(3);
  });

  test('if non-recursive, does not fire an update when dependencies change',
    () => {
      const mock = jest.fn();

      obj2.getLink('test').observe().content(false).on('update', mock);

      (obj2.getField('test') as BasicField)
        .set(`{${obj.id}|test}{${obj.id}|test.parent.2}`);
      (obj.getField('test') as BasicField).set('new value 3');
      (parent.getField('test.parent.2') as BasicField).set('new value 3');

      expect(mock).toHaveBeenCalledTimes(1);
    }
  );

  test('handles dependency changes', () => {
    const mock = jest.fn();

    obj2.getLink('test').observe().content(true).on('update', mock);

    (obj2.getField('test') as BasicField)
      .set(`new {${obj.id}|test}{${obj.id}|test.parent.2}`);
    expect(mock).toHaveBeenCalledTimes(1);

    // dependency field change causes update
    obj2.removeOwnField('test');
    expect(mock).toHaveBeenCalledTimes(2);
    obj2.addOwnField('test', new BasicField('new value 4'));
    expect(mock).toHaveBeenCalledTimes(3);

    // new dependencies cause update
    (obj2.getField('test') as BasicField).set(`{${parent.id}|test}`);
    expect(mock).toHaveBeenCalledTimes(4);

    // new dependency causes update
    (parent.getField('test') as BasicField).set('new value 5');
    expect(mock).toHaveBeenCalledTimes(5);

    // old dependency does not cause update
    (obj2.getField('test.parent.2') as BasicField).set('new value 6');
    expect(mock).toHaveBeenCalledTimes(5);
  });

  test('handles parent field visibility changes', () => {
    const mock = jest.fn();

    const parent = project.makeObject('test');
    parent.addOwnField('test.1', new BasicField('value1'));

    const obj = project.makeObject('test', parent);
    obj.addOwnField('test.1', new BasicField('value2'));

    obj.getLink('test.*')
      .observe().content(true).on('update', mock);

    (parent.getField('test.1') as BasicField).set('value3');
    expect(mock).not.toHaveBeenCalled();

    (obj.getField('test.1') as BasicField).set('value4');
    expect(mock).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test.1');
    expect(mock).toHaveBeenCalledTimes(2);

    obj.addOwnField('test.1', new BasicField('value5'));
    expect(mock).toHaveBeenCalledTimes(3);

    obj.addOwnField('test.2', new BasicField('value6'));
    expect(mock).toHaveBeenCalledTimes(4);

    parent.addOwnField('test.3', new BasicField('value6'));
    expect(mock).toHaveBeenCalledTimes(5);

    parent.removeOwnField('test.1');
    expect(mock).toHaveBeenCalledTimes(5);

    parent.removeOwnField('test.3');
    expect(mock).toHaveBeenCalledTimes(6);
  });

  describe('handles removing listeners', () => {
    test('with no dependencies', () => {
      const mock = jest.fn();

      const obs = obj.getLink('test.*').observe().content(true)
        .on('update', mock);

      (obj.getField('test.scope.1') as BasicField).set(
        `new value ${obj2.getLink('test')}`
      );
      (obj2.getField('test') as BasicField).set('new value 6');
      expect(mock).toHaveBeenCalledTimes(2);

      obs.destroy();

      (obj2.getField('test') as BasicField).set('new value 7');
      expect(mock).toHaveBeenCalledTimes(2);
    });

    test('with dependencies', () => {
      const mock = jest.fn();

      const obs = obj.getLink('test.*').observe().content(true)
        .on('update', mock);

      (obj.getField('test.scope.1') as BasicField).set('new value 5');
      expect(mock).toHaveBeenCalledTimes(1);

      (obj.getField('test') as BasicField).set('new value 5');
      expect(mock).toHaveBeenCalledTimes(1);

      obs.destroy();

      (obj.getField('test.scope.1') as BasicField).set('another new value 5');
      (obj.getField('test.scope.2') as BasicField).set('new value 5');
      (parent.getField('test.parent.1') as BasicField).set('new value 5');
      expect(mock).toHaveBeenCalledTimes(1);
    });
  });

  test('handles multiple overlapping listeners', () => {
    const mock1 = jest.fn();
    const mock2 = jest.fn();

    const parent = project.makeObject('test');
    const obj = project.makeObject('test', parent);

    parent.addOwnField('test.1', new BasicField(''));
    parent.addOwnField('test.2', new BasicField(''));
    parent.addOwnField('test.3', new BasicField(''));
    parent.addOwnField('test.nested.1', new BasicField(''));
    parent.addOwnField('test.nested.2', new BasicField(''));
    obj.addOwnField('test.1', new BasicField(''));
    obj.addOwnField('test.2', new BasicField(''));
    obj.addOwnField('test.nested.1', new BasicField(''));

    obj.getLink('test.*').observe().content(true)
      .on('update', mock1);
    const obs2 = obj.getLink('test.nested.*').observe().content(true)
      .on('update', mock2);

    (obj.getField('test.1') as BasicField).set('1');
    expect(mock1).toHaveBeenCalledTimes(1);
    expect(mock2).toHaveBeenCalledTimes(0);

    (obj.getField('test.nested.1') as BasicField).set('1');
    expect(mock1).toHaveBeenCalledTimes(2);
    expect(mock2).toHaveBeenCalledTimes(1);

    obj.addOwnField('test.nested.2', new BasicField(''));
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

    (obj.getField('test.nested.2') as BasicField).set('1');
    expect(mock1).toHaveBeenCalledTimes(6);
    expect(mock2).toHaveBeenCalledTimes(2);

    (obj.getField('test.nested.1') as BasicField).set('2');
    expect(mock1).toHaveBeenCalledTimes(7);
    expect(mock2).toHaveBeenCalledTimes(2);
  });
});