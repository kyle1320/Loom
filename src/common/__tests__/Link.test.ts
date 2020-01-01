import ObjectDB from '../data/db/ObjectDB';
import Link from '../data/Link';
import ComputedField from '../data/fields/ComputedField';

class BasicComputedField extends ComputedField {
  public get(): string {
    return '';
  }

  public dependencies(): Link[] {
    return [];
  }
}

test('can fetch field values from objects', () => {
  const db = new ObjectDB();

  const obj1 = db.makeObject('a', null);
  obj1.addOwnField('field1', 'value1');

  const obj2 = db.makeObject('b', null);
  obj2.addOwnField('field2', 'value2');

  const value1 = new Link(db, obj1.id, 'field1').getFieldValue();
  expect(value1).toBe('value1');

  const value2 = new Link(db, obj2.id, 'field2').getFieldValue();
  expect(value2).toBe('value2');
});

test('throws an error when fetching the value of an invalid field', () => {
  const db = new ObjectDB();

  const obj1 = db.makeObject('a', null);
  obj1.addOwnField('field1', 'value1');

  const obj2 = db.makeObject('b', null);
  obj2.addOwnField('field2', 'value2');

  expect(() => {
    new Link(db, obj1.id, '').getFieldValue();
  }).toThrow();

  expect(() => {
    new Link(db, obj2.id, 'field1').getFieldValue();
  }).toThrow();
});

test('can iterate over all fields matching a path', () => {
  const db = new ObjectDB();

  const obj = db.makeObject('a', null);
  obj.addOwnField('test', 'value1');
  obj.addOwnField('test.a', 'value2');
  obj.addOwnField('test.b', 'value3');
  obj.addOwnField('test.b.c', 'value4');
  obj.addOwnField('exclude', 'value5');

  const fields = new Link(db, obj.id, 'test.*').getFieldNames();
  expect([...fields]).toHaveLength(3);

  const values = new Link(db, obj.id, 'test.*').getFieldValues();
  expect(values).toMatchObject({
    'test.a': 'value2',
    'test.b': 'value3',
    'test.b.c': 'value4'
  });
});

test('can iterate over computed & mutable fields separately', () => {
  const db = new ObjectDB();

  db.registerClass('base', {
    'test1()': new BasicComputedField(),
    'test2()': new BasicComputedField()
  });

  const obj = db.makeObject('a', 'base');
  obj.addOwnField('test', 'value1');
  obj.addOwnField('test.a', 'value2');
  obj.addOwnField('test.b', 'value3');
  obj.addOwnField('test.b.c', 'value4');
  obj.addOwnField('exclude', 'value5');

  const mutable = new Link(db, obj.id, 'test.*').getFieldNames();
  expect([...mutable]).toHaveLength(3);

  const computed = new Link(db, obj.id, 'test*()').getFieldNames();
  expect([...computed]).toHaveLength(2);
});