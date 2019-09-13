import LObject from '../data/LObject';
import Project from '../data/Project';
import BasicField from '../extensions/BasicFields/BasicField';

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
    const change = jest.fn();

    obj.on('fieldAdded', add);
    obj.on('fieldRemoved', remove);
    obj.on('fieldChanged', change);

    obj.addOwnField('test', new BasicField(''));
    expect(add).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(change).toHaveBeenCalledTimes(0);

    obj.addOwnField('test', new BasicField('value'));
    expect(add).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(change).toHaveBeenCalledTimes(1);

    obj.addOwnField('test2', new BasicField('value'));
    expect(add).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(change).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test');
    expect(add).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test1');
    expect(add).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test2');
    expect(add).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(2);
    expect(change).toHaveBeenCalledTimes(1);
  });
});
