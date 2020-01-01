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

  const obj1 = db.makeObject('user');
  const obj2 = db.makeObject('user');
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

  const obj1 = db.makeObject('user');
  obj1.addOwnField('field1', 'value1');

  const obj2 = db.makeObject('user');
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