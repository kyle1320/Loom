import ObjectDB from '../data/db/ObjectDB';
import DataObject from '../data/objects/DataObject';

const db = new ObjectDB();

test('can be instantiated', () => {
  new DataObject(db);
});

test('can be serialized and deserialized', () => {
  const obj = new DataObject(db);
  const serial = obj.serialize();
  DataObject.deserialize(db, serial);
});

test('can have fields', () => {
  const obj = new DataObject(db);
  obj.addOwnField('test1', 'value1');
  obj.addOwnField('test2', 'value2');

  expect(obj.fields['test1']!.get(obj)).toEqual('value1');
  expect(obj.fields['test2']!.get(obj)).toEqual('value2');
});

test('can have a parent', () => {
  const parent = new DataObject(db);
  parent.addOwnField('test1', 'value1');

  const obj = new DataObject(db, parent);
  obj.addOwnField('test2', 'value2');

  expect(obj.fields['test1']!.get(obj)).toEqual('value1');
  expect(obj.fields['test2']!.get(obj)).toEqual('value2');
});

test('can have a chain of parents', () => {
  const grandparent = new DataObject(db);
  grandparent.addOwnField('test1', 'value1');
  grandparent.addOwnField('test2', 'hidden value');

  const parent = new DataObject(db, grandparent);
  parent.addOwnField('test2', 'value2');

  const obj = new DataObject(db, parent);
  obj.addOwnField('test3', 'value3');

  expect(obj.fields['test1']!.get(obj)).toEqual('value1');
  expect(obj.fields['test2']!.get(obj)).toEqual('value2');
  expect(obj.fields['test3']!.get(obj)).toEqual('value3');
});

describe('has methods to fetch fields', () => {
  const parent = new DataObject(db);
  parent.addOwnField('test', 'value1');
  parent.addOwnField('test.parent.1', 'value2');
  parent.addOwnField('test.parent.2', 'value3');

  const obj = new DataObject(db, parent);
  obj.addOwnField('test', 'value4');
  obj.addOwnField('test.scope.1', 'value5');
  obj.addOwnField('test.scope.2', 'value6');

  // test('can fetch own fields', () => {
  //   const own = obj.getOwnFields();
  //   expect([...own]).toHaveLength(3);
  // });

  // test('can fetch own field names', () => {
  //   const own = obj.getOwnFieldNames();
  //   expect([...own]).toHaveLength(3);
  // });

  // test('can fetch own fields with path', () => {
  //   const own = obj.getOwnFields('test.*');
  //   expect([...own]).toHaveLength(2);
  // });

  // test('can fetch own field names with path', () => {
  //   const own = obj.getOwnFieldNames('test.*');
  //   expect([...own]).toHaveLength(2);
  // });

  // test('can fetch all fields', () => {
  //   const all = obj.getFields();
  //   expect([...all]).toHaveLength(5);
  // });

  // test('can fetch all field names', () => {
  //   const all = obj.getFieldNames();
  //   expect([...all]).toHaveLength(5);
  // });

  // test('can fetch all fields with path', () => {
  //   const all = obj.getFields('test.*');
  //   expect([...all]).toHaveLength(4);

  //   const all2 = obj.getFieldNames('test.parent.*');
  //   expect([...all2]).toHaveLength(2);
  // });

  // test('can fetch all field names with path', () => {
  //   const all = obj.getFieldNames('test.*');
  //   expect([...all]).toHaveLength(4);

  //   const all2 = obj.getFieldNames('test.parent.*');
  //   expect([...all2]).toHaveLength(2);
  // });
});

describe('can listen for field addition / removal', () => {
  test('on an object with no parent', () => {
    const obj = db.makeObject();
    const add = jest.fn();
    const remove = jest.fn();
    const change = jest.fn();

    obj.on('fieldAdded', add);
    obj.on('fieldRemoved', remove);
    obj.on('fieldChanged', change);

    obj.addOwnField('test', '');
    expect(add).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(change).toHaveBeenCalledTimes(0);

    obj.addOwnField('test', 'value');
    expect(add).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(change).toHaveBeenCalledTimes(1);

    obj.addOwnField('test2', 'value');
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
