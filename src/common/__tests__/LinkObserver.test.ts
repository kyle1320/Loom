import ObjectDB from '../data/db/ObjectDB';
import Link from '../data/Link';

function mocks(link: Link): [jest.Mock, jest.Mock, jest.Mock] {
  const add = jest.fn();
  const remove = jest.fn();
  const change = jest.fn();

  link.observe()
    .on('fieldAdded', add)
    .on('fieldRemoved', remove)
    .on('fieldChanged', change);

  return [add, remove, change];
}

let counter = 1;
function count(): string {
  return `field${counter++}`;
}

describe('can listen for field changes on a single field', () => {
  test('additions', () => {
    const db = new ObjectDB();

    const obj = db.makeObject('a', null);
    const add = mocks(Link.to(obj, 'test'))[0];

    obj.addOwnField('test', count());
    expect(add).toHaveBeenCalledTimes(1);

    obj.addOwnField('test.scope.1', count());
    expect(add).toHaveBeenCalledTimes(1);
  });

  test('removals', () => {
    const db = new ObjectDB();

    const obj = db.makeObject('a', null);
    const remove = mocks(Link.to(obj, 'test'))[1];

    obj.addOwnField('test', count());
    expect(remove).toHaveBeenCalledTimes(0);

    obj.addOwnField('test.scope.1', count());
    expect(remove).toHaveBeenCalledTimes(0);

    obj.removeOwnField('test');
    expect(remove).toHaveBeenCalledTimes(1);
  });

  test('changes', () => {
    const db = new ObjectDB();

    const parent = db.makeObject('a', null);
    const obj = db.makeObject('b', parent);
    const change = mocks(Link.to(obj, 'test'))[2];

    obj.addOwnField('test', count());
    parent.addOwnField('test', count());
    obj.addOwnField('test.scope.1', count());
    expect(change).toHaveBeenCalledTimes(0);

    obj.removeOwnField('test');
    expect(change).toHaveBeenCalledTimes(1);

    obj.addOwnField('test', count());
    expect(change).toHaveBeenCalledTimes(2);

    obj.addOwnField('test', count());
    expect(change).toHaveBeenCalledTimes(3);
  });
});

describe('can listen for field changes on multiple fields', () => {
  test('additions', () => {
    const db = new ObjectDB();

    const obj = db.makeObject('a', null);
    const add = mocks(Link.to(obj, 'test.*'))[0];

    obj.addOwnField('test', count());
    expect(add).toHaveBeenCalledTimes(0);

    obj.addOwnField('test.1', count());
    expect(add).toHaveBeenCalledTimes(1);

    obj.addOwnField('test.scope.1', count());
    expect(add).toHaveBeenCalledTimes(2);
  });

  test('removals', () => {
    const db = new ObjectDB();

    const obj = db.makeObject('a', null);
    const remove = mocks(Link.to(obj, 'test.*'))[1];

    obj.addOwnField('test', count());
    expect(remove).toHaveBeenCalledTimes(0);

    obj.addOwnField('test.1', count());
    obj.addOwnField('test.scope.1', count());
    expect(remove).toHaveBeenCalledTimes(0);

    obj.removeOwnField('test');
    expect(remove).toHaveBeenCalledTimes(0);

    obj.removeOwnField('test.scope.1');
    expect(remove).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test.1');
    expect(remove).toHaveBeenCalledTimes(2);
  });

  test('changes', () => {
    const db = new ObjectDB();

    const parent = db.makeObject('a', null);
    const obj = db.makeObject('b', parent);
    const change = mocks(Link.to(obj, 'test.*'))[2];

    obj.addOwnField('test', count());
    obj.addOwnField('test.1', count());
    parent.addOwnField('test.1', count());
    expect(change).toHaveBeenCalledTimes(0);

    parent.addOwnField('test.scope.1', count());
    obj.addOwnField('test.scope.1', count());
    expect(change).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test');
    expect(change).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test.1');
    expect(change).toHaveBeenCalledTimes(2);

    obj.addOwnField('test.scope.1', count());
    expect(change).toHaveBeenCalledTimes(3);
  });
});