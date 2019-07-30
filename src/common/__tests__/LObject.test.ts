import LObject from '../data/LObject';
import Project from '../data/Project';
import BasicField from '../extensions/BasicFields/BasicField';
import Field from '../data/Field';

const project = new Project();

test('can be instantiated', () => {
  new LObject(project, 'test');
});

test('can be serialized and deserialized', () => {
  const obj = new LObject(project, 'test');
  const serial = obj.serialize();
  LObject.deserialize(project, serial);
});

test('can have fields', () => {
  const obj = new LObject(project, 'test');
  obj.addOwnField('test1', new BasicField('value1'));
  obj.addOwnField('test2', new BasicField('value2'));

  expect(obj.getFieldValue('test1')).toEqual('value1');
  expect(obj.getFieldValue('test2')).toEqual('value2');
});

test('can have a parent', () => {
  const parent = new LObject(project, 'test');
  parent.addOwnField('test1', new BasicField('value1'));

  const obj = new LObject(project, 'test', parent);
  obj.addOwnField('test2', new BasicField('value2'));

  expect(obj.getFieldValue('test1')).toEqual('value1');
  expect(obj.getFieldValue('test2')).toEqual('value2');
});

test('can have a chain of parents', () => {
  const grandparent = new LObject(project, 'test');
  grandparent.addOwnField('test1', new BasicField('value1'));
  grandparent.addOwnField('test2', new BasicField('hidden value'));

  const parent = new LObject(project, 'test', grandparent);
  parent.addOwnField('test2', new BasicField('value2'));

  const obj = new LObject(project, 'test', parent);
  obj.addOwnField('test3', new BasicField('value3'));

  expect(obj.getFieldValue('test1')).toEqual('value1');
  expect(obj.getFieldValue('test2')).toEqual('value2');
  expect(obj.getFieldValue('test3')).toEqual('value3');
});

describe('has methods to fetch fields', () => {
  const parent = new LObject(project, 'test');
  parent.addOwnField('test', new BasicField('value1'));
  parent.addOwnField('test.parent.1', new BasicField('value2'));
  parent.addOwnField('test.parent.2', new BasicField('value3'));

  const obj = new LObject(project, 'test', parent);
  obj.addOwnField('test', new BasicField('value4'));
  obj.addOwnField('test.scope.1', new BasicField('value5'));
  obj.addOwnField('test.scope.2', new BasicField('value6'));

  test('can fetch own fields', () => {
    const own = obj.getOwnFields();
    expect([...own]).toHaveLength(3);
  });

  test('can fetch own field names', () => {
    const own = obj.getOwnFieldNames();
    expect([...own]).toHaveLength(3);
  });

  test('can fetch own fields with path', () => {
    const own = obj.getOwnFields('test.*');
    expect([...own]).toHaveLength(2);
  });

  test('can fetch own field names with path', () => {
    const own = obj.getOwnFieldNames('test.*');
    expect([...own]).toHaveLength(2);
  });

  test('can fetch all fields', () => {
    const all = obj.getFields();
    expect([...all]).toHaveLength(5);
  });

  test('can fetch all field names', () => {
    const all = obj.getFieldNames();
    expect([...all]).toHaveLength(5);
  });

  test('can fetch all fields with path', () => {
    const all = obj.getFields('test.*');
    expect([...all]).toHaveLength(4);

    const all2 = obj.getFieldNames('test.parent.*');
    expect([...all2]).toHaveLength(2);
  });

  test('can fetch all field names with path', () => {
    const all = obj.getFieldNames('test.*');
    expect([...all]).toHaveLength(4);

    const all2 = obj.getFieldNames('test.parent.*');
    expect([...all2]).toHaveLength(2);
  });
});

describe('can listen for field addition / removal', () => {
  test('on an object with no parent', () => {
    const obj = project.makeObject('test');
    const add = jest.fn();
    const remove = jest.fn();

    obj.on('fieldAdded', add);
    obj.on('fieldRemoved', remove);

    obj.addOwnField('test', new BasicField(''));
    expect(add).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(0);

    obj.addOwnField('test', new BasicField('value'));
    expect(add).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(1);

    obj.addOwnField('test2', new BasicField('value'));
    expect(add).toHaveBeenCalledTimes(3);
    expect(remove).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test');
    expect(add).toHaveBeenCalledTimes(3);
    expect(remove).toHaveBeenCalledTimes(2);

    obj.removeOwnField('test1');
    expect(add).toHaveBeenCalledTimes(3);
    expect(remove).toHaveBeenCalledTimes(2);

    obj.removeOwnField('test2');
    expect(add).toHaveBeenCalledTimes(3);
    expect(remove).toHaveBeenCalledTimes(3);
  });
});

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

    obj.addPathListener('test', mock);

    (obj.getField('test') as BasicField).set('new value');
    (obj.getField('test.scope.1') as BasicField).set('new value');

    expect(mock).toHaveBeenCalledTimes(1);
  });

  test('can listen on a path with a wildcard', () => {
    const mock = jest.fn();

    obj.addPathListener('test.*', mock);

    (obj.getField('test') as BasicField).set('new value 2');
    (obj.getField('test.scope.1') as BasicField).set('new value 2');
    (obj.getField('test.scope.2') as BasicField).set('new value 2');

    expect(mock).toHaveBeenCalledTimes(2);
  });

  test('fires an update when dependencies change', () => {
    const mock = jest.fn();

    obj2.addPathListener('test', mock);

    (obj2.getField('test') as BasicField)
      .set(`{${obj.id}|test}{${obj.id}|test.parent.2}`);
    (obj.getField('test') as BasicField)
      .set('new value 3');
    (parent.getField('test.parent.2') as BasicField)
      .set('new value 3');

    expect(mock).toHaveBeenCalledTimes(3);
  });

  test('handles dependency changes', () => {
    const mock = jest.fn();

    obj2.addPathListener('test', mock);

    (obj2.getField('test') as BasicField)
      .set(`new {${obj.id}|test}{${obj.id}|test.parent.2}`);
    expect(mock).toHaveBeenCalledTimes(1);

    // new dependencies
    (obj2.getField('test') as BasicField).set(`{${parent.id}|test}`);
    expect(mock).toHaveBeenCalledTimes(2);

    // new dependency causes update
    (parent.getField('test') as BasicField).set('new value 4');
    expect(mock).toHaveBeenCalledTimes(3);

    // old dependency does not cause update
    (obj2.getField('test.parent.2') as BasicField).set('new value 4');
    expect(mock).toHaveBeenCalledTimes(3);
  });

  test('handles parent field visibility changes', () => {
    const mock = jest.fn();

    const parent = project.makeObject('test');
    parent.addOwnField('test.1', new BasicField('value1'));

    const obj = project.makeObject('test', parent);
    obj.addOwnField('test.1', new BasicField('value2'));

    obj.addPathListener('test.*', mock);

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

    // update only triggered on add, not remove
    parent.removeOwnField('test.3');
    expect(mock).toHaveBeenCalledTimes(5);
  });

  test('handles removing listeners', () => {
    const mock = jest.fn();

    obj.addPathListener('test.*', mock);

    (obj.getField('test.scope.1') as BasicField).set('new value 5');
    expect(mock).toHaveBeenCalledTimes(1);

    (obj.getField('test') as BasicField).set('new value 5');
    expect(mock).toHaveBeenCalledTimes(1);

    obj.removePathListener('test.*', mock);

    (obj.getField('test.scope.1') as BasicField).set('another new value 5');
    (obj.getField('test.scope.2') as BasicField).set('new value 5');
    (parent.getField('test.parent.1') as BasicField).set('new value 5');
    expect(mock).toHaveBeenCalledTimes(1);
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

    obj.addPathListener('test.*', mock1);
    obj.addPathListener('test.nested.*', mock2);

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

    obj.removePathListener('test.nested.*', mock2);
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

  test('handles inherited field dependencies', () => {
    class TestField extends Field {
      public get(): string {
        return '';
      }
      public dependencies(context: LObject): string[] {
        return [`{${context.id}|dep}`];
      }
      public clone(): Field {
        return this;
      }
      public serialize(): Field.SerializedData {
        return {type:'', value:''};
      }
    }

    const parent = project.makeObject('test');
    const obj = project.makeObject('test', parent);

    parent.addOwnField('test', new TestField());
    parent.addOwnField('dep', new BasicField(''));

    obj.addOwnField('dep', new BasicField(''));

    const mock = jest.fn();

    obj.addPathListener('dep', mock);
    (parent.getField('dep') as BasicField).set('test');
    expect(mock).toHaveBeenCalledTimes(0);

    (obj.getField('dep') as BasicField).set('test');
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

