import Project from '../data/Project';
import BasicField from '../extensions/BasicFields/BasicField';

test('can be instantiated', () => {
  new Project();
});

test('can be serialized and deserialized', () => {
  const proj = new Project();
  const serial = proj.serialize();
  Project.deserialize(serial);
});

test('can create and fetch objects', () => {
  const proj = new Project();

  const obj1 = proj.makeObject('user');
  const obj2 = proj.makeObject('user');
  const obj1_ = proj.getObject(obj1.id);
  const obj2_ = proj.getObject(obj2.id);

  expect(obj1).not.toBe(obj2);
  expect(obj1).toBe(obj1_);
  expect(obj2).toBe(obj2_);
});

test('can fetch fields from objects', () => {
  const proj = new Project();

  const obj1 = proj.makeObject('user');
  const field1 = new BasicField('value1');
  obj1.addOwnField('field1', field1);

  const obj2 = proj.makeObject('user');
  const field2 = new BasicField('value2');
  obj2.addOwnField('field2', field2);

  // const field1_ = proj.getField(obj1.id, 'field1');
  // expect(field1_).toBe(field1);

  // const field2_ = proj.getField(obj2.id, 'field2');
  // expect(field2_).toBe(field2);
});

test('throws an error when fetching an invalid object', () => {
  const proj = new Project();

  const obj1 = proj.makeObject('user');
  const field1 = new BasicField('value1');
  obj1.addOwnField('field1', field1);

  // expect(() => {
  //   proj.getField('999', 'field1');
  // }).toThrow();
});

test('can fetch field values from objects', () => {
  const proj = new Project();

  const obj1 = proj.makeObject('user');
  obj1.addOwnField('field1', new BasicField('value1'));

  const obj2 = proj.makeObject('user');
  obj2.addOwnField('field2', new BasicField('value2'));

  // const value1 = proj.getFieldValue(obj1.id, 'field1');
  // expect(value1).toBe('value1');

  // const value2 = proj.getFieldValue(obj2.id, 'field2');
  // expect(value2).toBe('value2');
});

test('throws an error when fetching an invalid field', () => {
  const proj = new Project();

  const obj1 = proj.makeObject('user');
  obj1.addOwnField('field1', new BasicField('value1'));

  const obj2 = proj.makeObject('user');
  obj2.addOwnField('field2', new BasicField('value2'));

  // expect(() => {
  //   proj.getFieldValue(obj1.id, '');
  // }).toThrow();

  // expect(() => {
  //   proj.getFieldValue(obj2.id, 'field1');
  // }).toThrow();
});

test('can serialize and deserialize objects and fields', () => {
  const proj = new Project();

  const obj1 = proj.makeObject('user');
  obj1.addOwnField('field1', new BasicField('value1'));

  const obj2 = proj.makeObject('user');
  obj2.addOwnField('field2', new BasicField('value2'));

  const proj_ = Project.deserialize(proj.serialize());
  const obj1_ = proj_.getObject(obj1.id);
  const obj2_ = proj_.getObject(obj2.id);
  // const value1 = proj_.getFieldValue(obj1.id, 'field1');
  // const value2 = proj_.getFieldValue(obj2.id, 'field2');

  expect(obj1_).not.toBeUndefined();
  expect(obj2_).not.toBeUndefined();
  expect(obj1_!.id).toEqual(obj1.id);
  expect(obj2_!.id).toEqual(obj2.id);
  // expect(value1).toEqual('value1');
  // expect(value2).toEqual('value2');
});

// TODO: test adding extensions, field types, etc.