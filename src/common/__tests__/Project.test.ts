import Project from '../data/Project';

test('can be instantiated', () => {
  new Project();
});

test('can be serialized and deserialized', () => {
  const proj = new Project();
  const serial = proj.serialize();
  Project.deserialize(serial, []);
});

test('can create and fetch objects', () => {
  const proj = new Project();

  const obj1 = proj.makeObject('user');
  const obj2 = proj.makeObject('user');
  const obj1_ = proj.getObject(obj1.id);
  const obj2_ = proj.getObject(obj2.id);
  const obj3_ = proj.getObject('unknown');

  expect(obj1).not.toBe(obj2);
  expect(obj1).toBe(obj1_);
  expect(obj2).toBe(obj2_);
  expect(obj3_).toBeUndefined();
});

test('can serialize and deserialize objects and fields', () => {
  const proj = new Project();

  const obj1 = proj.makeObject('user');
  obj1.addOwnField('field1', 'value1');

  const obj2 = proj.makeObject('user');
  obj2.addOwnField('field2', 'value2');

  const proj_ = Project.deserialize(proj.serialize(), []);
  const obj1_ = proj_.getObject(obj1.id)!;
  const obj2_ = proj_.getObject(obj2.id)!;
  const value1 = obj1_.fields['field1'].get(obj1_);
  const value2 = obj2_.fields['field2'].get(obj2_);

  expect(obj1_).not.toBeUndefined();
  expect(obj2_).not.toBeUndefined();
  expect(obj1_!.id).toEqual(obj1.id);
  expect(obj2_!.id).toEqual(obj2.id);
  expect(value1).toEqual('value1');
  expect(value2).toEqual('value2');
});

// TODO: test adding extensions, field types, etc.