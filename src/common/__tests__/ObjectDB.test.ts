import ObjectDB from '../data/db/ObjectDB';

test('can be instantiated', () => {
  new ObjectDB();
});

test('can be serialized and deserialized', () => {
  const db = new ObjectDB();
  const serial = db.serialize();
  ObjectDB.deserialize(serial);
});

test('can create and fetch objects', () => {
  const db = new ObjectDB();

  const obj1 = db.makeObject('a', null);
  const obj2 = db.makeObject('b', null);
  const obj1_ = db.getObject(obj1.id);
  const obj2_ = db.getObject(obj2.id);
  const obj3_ = db.getObject('unknown');

  expect(obj1).not.toBe(obj2);
  expect(obj1).toBe(obj1_);
  expect(obj2).toBe(obj2_);
  expect(obj3_).toBeUndefined();
});

test('can serialize and deserialize objects and fields', () => {
  const db = new ObjectDB();

  const obj1 = db.makeObject('a', null);
  obj1.addOwnField('field1', 'value1');

  const obj2 = db.makeObject('b', null);
  obj2.addOwnField('field2', 'value2');

  const db_ = ObjectDB.deserialize(db.serialize());
  const obj1_ = db_.getObject(obj1.id)!;
  const obj2_ = db_.getObject(obj2.id)!;
  const value1 = obj1_.fields['field1']!.get(obj1_);
  const value2 = obj2_.fields['field2']!.get(obj2_);

  expect(obj1_).not.toBeUndefined();
  expect(obj2_).not.toBeUndefined();
  expect(obj1_!.id).toEqual(obj1.id);
  expect(obj2_!.id).toEqual(obj2.id);
  expect(value1).toEqual('value1');
  expect(value2).toEqual('value2');
});

test('can serialize and deserialize objects with inheritance', () => {
  const db = new ObjectDB();

  const obj1 = db.makeObject('a', null);
  obj1.addOwnField('field1', 'value1');

  const obj2 = db.makeObject('b', obj1);
  obj2.addOwnField('field2', 'value2');

  const db_ = ObjectDB.deserialize(db.serialize());
  const obj1_ = db_.getObject(obj1.id)!;
  const obj2_ = db_.getObject(obj2.id)!;

  expect(obj2_.parent).toBe(obj1_);
});

test('can store objects at nested paths', () => {
  const db = new ObjectDB();

  const obj1 = db.makeObject('a', null);
  const obj2 = db.makeObject('b', null);
  const obj3 = db.makeObject('a/b', null);
  const obj4 = db.makeObject('c/d/e/f', null);

  expect(db.getObjectAtPath('a')).toBe(obj1);
  expect(db.getObjectAtPath('b')).toBe(obj2);
  expect(db.getObjectAtPath('a/b')).toBe(obj3);
  expect(db.getObjectAtPath('c/d/e/f')).toBe(obj4);
  expect(db.getObjectAtPath('c/d/e')).toBeUndefined();
});

test('can change object paths', () => {
  const db = new ObjectDB();

  const obj = db.makeObject('a', null);
  const obj2 = db.makeObject('b', null);

  expect(() => db.place('b', obj)).toThrow();

  db.place('c', obj2);
  expect(db.getObjectAtPath('b')).toBeUndefined();
  expect(db.getObjectAtPath('c')).toBe(obj2);

  db.place('a/b/c', obj);
  expect(db.getObjectAtPath('a')).toBeUndefined();
  expect(db.getObjectAtPath('a/b/c')).toBe(obj);
});